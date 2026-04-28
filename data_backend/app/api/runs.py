from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import SourceRun
from app.schemas import SourceRunOut

router = APIRouter(prefix="/runs", tags=["runs"])


@router.get("", response_model=list[SourceRunOut])
async def list_runs(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=50, ge=1, le=500),
    source: str | None = None,
) -> list[SourceRun]:
    stmt = select(SourceRun).order_by(SourceRun.started_at.desc()).limit(limit)
    if source:
        stmt = stmt.where(SourceRun.source == source)
    result = await db.execute(stmt)
    return list(result.scalars().all())
