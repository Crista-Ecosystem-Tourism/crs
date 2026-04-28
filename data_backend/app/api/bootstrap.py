from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.pipeline import bootstrap as run_bootstrap
from app.db import get_db
from app.models import BootstrapState
from app.schemas import BootstrapStatus
from app.security import require_admin

log = logging.getLogger(__name__)

router = APIRouter(prefix="/bootstrap", tags=["bootstrap"])


@router.get("", response_model=BootstrapStatus)
async def status(db: AsyncSession = Depends(get_db)) -> BootstrapStatus:
    obj = (await db.execute(select(BootstrapState).order_by(BootstrapState.id))).scalars().first()
    if obj is None or obj.completed_at is None:
        return BootstrapStatus(bootstrapped=False)
    return BootstrapStatus(
        bootstrapped=True,
        completed_at=obj.completed_at,
        last_run_id=obj.last_run_id,
        notes=obj.notes,
    )


@router.post("")
async def trigger(
    background: BackgroundTasks,
    _: dict[str, Any] = Depends(require_admin),
) -> dict[str, str]:
    log.info("manual bootstrap triggered")
    background.add_task(_safe_bootstrap)
    return {"status": "scheduled"}


async def _safe_bootstrap() -> None:
    try:
        await run_bootstrap()
    except Exception:  # noqa: BLE001
        log.exception("bootstrap crashed")
