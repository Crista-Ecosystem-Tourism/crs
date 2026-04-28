"""UPSERT нормализованных мест в Postgres."""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Iterable
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.normalizer import NormalizedPlace
from app.models import Place

log = logging.getLogger(__name__)


async def upsert_places(
    session: AsyncSession, places: Iterable[NormalizedPlace]
) -> tuple[int, int]:
    """Возвращает (inserted, updated)."""

    rows = list(places)
    if not rows:
        return 0, 0

    inserted = 0
    updated = 0
    now = datetime.now(timezone.utc)

    for place in rows:
        payload = {
            "source": place.source,
            "external_id": place.external_id,
            "name": place.name,
            "alt_names": place.alt_names,
            "category": place.category,
            "subcategory": place.subcategory,
            "city": place.city,
            "region": place.region,
            "country": place.country,
            "lat": place.lat,
            "lng": place.lng,
            "description": place.description,
            "description_lang": place.description_lang,
            "tags": place.tags,
            "rating": place.rating,
            "hours": place.hours,
            "phone": place.phone,
            "website": place.website,
            "wiki_q": place.wiki_q,
            "image_urls": place.image_urls,
            "license": place.license,
            "attribution": place.attribution,
            "source_url": place.source_url,
            "embedding_synced": False,
            "last_seen_at": now,
            "updated_at": now,
        }

        stmt = pg_insert(Place.__table__).values(**payload)
        stmt = stmt.on_conflict_do_update(
            index_elements=["source", "external_id"],
            set_={
                "name": stmt.excluded.name,
                "alt_names": stmt.excluded.alt_names,
                "category": stmt.excluded.category,
                "subcategory": stmt.excluded.subcategory,
                "city": stmt.excluded.city,
                "region": stmt.excluded.region,
                "country": stmt.excluded.country,
                "lat": stmt.excluded.lat,
                "lng": stmt.excluded.lng,
                "description": stmt.excluded.description,
                "description_lang": stmt.excluded.description_lang,
                "tags": stmt.excluded.tags,
                "rating": stmt.excluded.rating,
                "hours": stmt.excluded.hours,
                "phone": stmt.excluded.phone,
                "website": stmt.excluded.website,
                "wiki_q": stmt.excluded.wiki_q,
                "image_urls": stmt.excluded.image_urls,
                "license": stmt.excluded.license,
                "attribution": stmt.excluded.attribution,
                "source_url": stmt.excluded.source_url,
                "embedding_synced": False,
                "last_seen_at": stmt.excluded.last_seen_at,
                "updated_at": stmt.excluded.updated_at,
            },
        ).returning(Place.id, Place.created_at)

        result = await session.execute(stmt)
        row = result.first()
        if row is None:
            continue
        _, created_at = row
        if abs((now - created_at).total_seconds()) < 5:
            inserted += 1
        else:
            updated += 1

    await session.commit()
    return inserted, updated


async def fetch_pending_for_embedding(
    session: AsyncSession, limit: int = 500
) -> list[Place]:
    stmt = (
        select(Place)
        .where(Place.embedding_synced.is_(False))
        .order_by(Place.created_at)
        .limit(limit)
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def mark_embedded(session: AsyncSession, ids: Iterable[UUID]) -> None:
    ids_list = list(ids)
    if not ids_list:
        return
    await session.execute(
        update(Place)
        .where(Place.id.in_(ids_list))
        .values(embedding_synced=True)
    )
    await session.commit()
