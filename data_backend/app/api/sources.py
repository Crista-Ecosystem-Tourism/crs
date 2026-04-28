from __future__ import annotations

import asyncio
import logging
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from app.core.pipeline import run_all_sources, run_source
from app.schemas import RunRequest, SourceInfo
from app.security import require_admin
from app.sources.registry import list_sources

log = logging.getLogger(__name__)

router = APIRouter(prefix="/sources", tags=["sources"])


@router.get("", response_model=list[SourceInfo])
async def get_sources() -> list[SourceInfo]:
    return [
        SourceInfo(
            id=src.id,
            title=src.title,
            description=src.description,
            requires_key=src.requires_key,
        )
        for src in list_sources()
    ]


@router.post("/run-all")
async def trigger_run_all(
    background: BackgroundTasks,
    body: RunRequest | None = None,
    _: dict[str, Any] = Depends(require_admin),
) -> dict[str, str]:
    scope = body.scope if body else None
    log.info("schedule run-all (scope=%s)", scope)
    background.add_task(_safe_run_all, scope)
    return {"status": "scheduled"}


@router.post("/{source_id}/run")
async def trigger_run(
    source_id: str,
    background: BackgroundTasks,
    body: RunRequest | None = None,
    _: dict[str, Any] = Depends(require_admin),
) -> dict[str, str]:
    if source_id not in {src.id for src in list_sources()}:
        raise HTTPException(status_code=404, detail=f"Источник {source_id!r} не найден")
    scope = body.scope if body else None
    log.info("schedule run %s (scope=%s)", source_id, scope)
    background.add_task(_safe_run_source, source_id, scope)
    return {"status": "scheduled"}


async def _safe_run_all(scope: str | None) -> None:
    try:
        await run_all_sources(scope)
    except Exception:  # noqa: BLE001
        log.exception("run-all crashed")


async def _safe_run_source(source_id: str, scope: str | None) -> None:
    try:
        await run_source(source_id, scope)
    except Exception:  # noqa: BLE001
        log.exception("run %s crashed", source_id)
