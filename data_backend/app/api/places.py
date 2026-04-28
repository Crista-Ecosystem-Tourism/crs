from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Place
from app.schemas import PlaceOut

router = APIRouter(prefix="/places", tags=["places"])


@router.get("", response_model=list[PlaceOut])
async def list_places(
    db: AsyncSession = Depends(get_db),
    country: str | None = Query(default=None, max_length=8),
    city: str | None = Query(default=None, max_length=128),
    category: str | None = Query(default=None, max_length=32),
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
) -> list[Place]:
    stmt = select(Place).order_by(Place.name).offset(offset).limit(limit)
    if country:
        stmt = stmt.where(Place.country == country)
    if city:
        stmt = stmt.where(Place.city == city)
    if category:
        stmt = stmt.where(Place.category == category)
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/{place_id}", response_model=PlaceOut)
async def get_place(place_id: UUID, db: AsyncSession = Depends(get_db)) -> Place:
    obj = await db.get(Place, place_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Место не найдено")
    return obj
