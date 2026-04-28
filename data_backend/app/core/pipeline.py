"""Высокоуровневый ETL: fetch → enrich → upsert → reindex Chroma."""
from __future__ import annotations

import logging
import traceback
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import reindex_batch_size
from app.core.chroma_indexer import cleanup_old_seeds, reindex_chroma
from app.core.normalizer import (
    NormalizedPlace,
    deduplicate,
    merge_wikidata_enrich,
)
from app.core.repository import (
    fetch_pending_for_embedding,
    mark_embedded,
    upsert_places,
)
from app.db import SessionFactory
from app.models import BootstrapState, Place, SourceRun
from app.sources.registry import get_source, list_sources
from app.sources.wikidata import enrich_with_wikidata

log = logging.getLogger(__name__)


async def _open_run(session: AsyncSession, source: str, scope: str | None) -> SourceRun:
    run = SourceRun(source=source, scope=scope, status="running")
    session.add(run)
    await session.commit()
    await session.refresh(run)
    return run


async def _close_run(
    session: AsyncSession,
    run: SourceRun,
    *,
    status: str,
    fetched: int = 0,
    inserted: int = 0,
    updated: int = 0,
    skipped: int = 0,
    errors: list[Any] | None = None,
    notes: str | None = None,
) -> None:
    run.status = status
    run.finished_at = datetime.now(timezone.utc)
    run.fetched = fetched
    run.inserted = inserted
    run.updated = updated
    run.skipped = skipped
    if errors is not None:
        run.errors = errors
    if notes is not None:
        run.notes = notes
    await session.commit()


async def run_source(source_id: str, scope: str | None = None) -> dict[str, Any]:
    src = get_source(source_id)
    log.info("== run source %s scope=%s ==", source_id, scope)

    async with SessionFactory() as session:
        run = await _open_run(session, source_id, scope)

        fetched = 0
        skipped = 0
        errors: list[dict] = []
        normalized: list[NormalizedPlace] = []
        try:
            async for batch in src.fetch(scope):
                fetched += batch.fetched
                skipped += batch.skipped
                normalized.extend(batch.places)
                if batch.errors:
                    errors.extend(batch.errors)
        except Exception as exc:  # noqa: BLE001
            log.exception("source fetch error: %s", exc)
            await _close_run(
                session,
                run,
                status="failed",
                fetched=fetched,
                skipped=skipped,
                errors=[*errors, {"error": str(exc), "trace": traceback.format_exc()}],
            )
            return {"status": "failed", "source": source_id, "fetched": fetched}

        normalized = deduplicate(normalized)

        enrich_payload: list[NormalizedPlace] = []
        if source_id != "wikidata":
            enrichable = [p for p in normalized if p.wiki_q]
            if enrichable:
                try:
                    enriched_map = await enrich_with_wikidata([p.wiki_q for p in enrichable if p.wiki_q])
                    for place in enrichable:
                        info = enriched_map.get(place.wiki_q)
                        if info:
                            merge_wikidata_enrich(place, info)
                except Exception as exc:  # noqa: BLE001
                    log.warning("wikidata enrich skipped: %s", exc)

        try:
            inserted, updated = await upsert_places(session, normalized)
        except Exception as exc:  # noqa: BLE001
            log.exception("upsert failed: %s", exc)
            await _close_run(
                session,
                run,
                status="failed",
                fetched=fetched,
                skipped=skipped,
                errors=[*errors, {"error": str(exc), "trace": traceback.format_exc()}],
            )
            return {"status": "failed", "source": source_id}

        await _close_run(
            session,
            run,
            status="ok",
            fetched=fetched,
            inserted=inserted,
            updated=updated,
            skipped=skipped,
            errors=errors,
        )

    log.info(
        "== source %s done fetched=%d ins=%d upd=%d skipped=%d errors=%d ==",
        source_id,
        fetched,
        inserted,
        updated,
        skipped,
        len(errors),
    )
    return {
        "status": "ok",
        "source": source_id,
        "fetched": fetched,
        "inserted": inserted,
        "updated": updated,
        "skipped": skipped,
        "errors": len(errors),
    }


async def run_all_sources(scope: str | None = None) -> list[dict[str, Any]]:
    results = []
    for src in list_sources():
        if src.requires_key and not src.is_configured():
            log.info("source %s requires key — skip", src.id)
            results.append({"status": "skipped", "source": src.id, "reason": "no_key"})
            continue
        result = await run_source(src.id, scope)
        results.append(result)
    return results


async def reindex_pending(batch_size: int | None = None) -> dict[str, Any]:
    """Берёт места с embedding_synced=false, сериализует и шлёт в vectorization."""

    size = batch_size or reindex_batch_size()
    total_indexed = 0
    batches = 0

    async with SessionFactory() as session:
        while True:
            places = await fetch_pending_for_embedding(session, limit=size)
            if not places:
                break
            batches += 1
            payload = [_place_to_record(p) for p in places]
            result = await reindex_chroma(payload)
            if result.get("status") != "ok":
                log.warning("reindex_chroma not ok: %s", result)
                break
            await mark_embedded(session, [p.id for p in places])
            total_indexed += len(places)
            cleanup_old_seeds()

    return {"status": "ok", "indexed": total_indexed, "batches": batches}


def _place_to_record(place: Place) -> dict[str, Any]:
    """Сериализация Place под формат, ожидаемый vectorization /load/json.

    Используем плоскую структуру, совместимую с текущим data.json.
    """

    desc = place.description or place.name
    text_parts = [
        place.name,
        place.category,
        place.subcategory or "",
        place.city or "",
        place.country or "",
        desc,
    ]
    page_content = ". ".join(p for p in text_parts if p)

    return {
        "id": str(place.id),
        "external_id": place.external_id,
        "source": place.source,
        "name": place.name,
        "category": place.category,
        "subcategory": place.subcategory,
        "city": place.city,
        "region": place.region,
        "country": place.country,
        "lat": place.lat,
        "lng": place.lng,
        "latitude": place.lat,
        "longitude": place.lng,
        "description": desc,
        "page_content": page_content,
        "tags": place.tags,
        "rating": place.rating,
        "image": place.image_urls[0] if place.image_urls else None,
        "image_urls": place.image_urls,
        "website": place.website,
        "phone": place.phone,
        "license": place.license,
        "attribution": place.attribution,
        "source_url": place.source_url,
    }


async def bootstrap() -> dict[str, Any]:
    """Полный прогон всех источников + переиндексация Chroma + отметка bootstrap."""

    log.info("=== BOOTSTRAP START ===")
    source_results = await run_all_sources()
    reindex_result = await reindex_pending()

    async with SessionFactory() as session:
        existing = (
            await session.execute(select(BootstrapState).order_by(BootstrapState.id))
        ).scalars().first()
        if existing is None:
            existing = BootstrapState(completed_at=datetime.now(timezone.utc))
            session.add(existing)
        else:
            existing.completed_at = datetime.now(timezone.utc)
        await session.commit()

    log.info("=== BOOTSTRAP DONE ===")
    return {"sources": source_results, "reindex": reindex_result}


async def maybe_auto_bootstrap() -> None:
    """Стартует bootstrap, если БД пуста."""

    async with SessionFactory() as session:
        from sqlalchemy import func

        total = (await session.execute(select(func.count(Place.id)))).scalar() or 0
    if total > 0:
        log.info("auto bootstrap: data_place уже содержит %d записей — пропускаю", total)
        return
    log.info("auto bootstrap: data_place пустая — запускаю прогрев")
    await bootstrap()
