from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Place
from app.schemas import StatsOut

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("", response_model=StatsOut)
async def get_stats(db: AsyncSession = Depends(get_db)) -> StatsOut:
    total = (await db.execute(select(func.count(Place.id)))).scalar() or 0

    by_source_rows = (
        await db.execute(select(Place.source, func.count(Place.id)).group_by(Place.source))
    ).all()
    by_country_rows = (
        await db.execute(
            select(Place.country, func.count(Place.id))
            .where(Place.country.is_not(None))
            .group_by(Place.country)
        )
    ).all()
    by_category_rows = (
        await db.execute(select(Place.category, func.count(Place.id)).group_by(Place.category))
    ).all()
    pending = (
        await db.execute(
            select(func.count(Place.id)).where(Place.embedding_synced.is_(False))
        )
    ).scalar() or 0

    return StatsOut(
        total_places=int(total),
        by_source={row[0]: int(row[1]) for row in by_source_rows},
        by_country={row[0]: int(row[1]) for row in by_country_rows},
        by_category={row[0]: int(row[1]) for row in by_category_rows},
        embeddings_pending=int(pending),
    )
