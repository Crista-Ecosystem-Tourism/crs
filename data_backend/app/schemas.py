from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class HealthOut(BaseModel):
    ok: bool = True
    service: str = "data_backend"


class PlaceOut(BaseModel):
    id: UUID
    source: str
    external_id: str
    name: str
    alt_names: dict[str, Any] = Field(default_factory=dict)
    category: str
    subcategory: str | None = None
    city: str | None = None
    region: str | None = None
    country: str | None = None
    lat: float
    lng: float
    description: str | None = None
    description_lang: str | None = None
    tags: dict[str, Any] = Field(default_factory=dict)
    rating: float | None = None
    hours: dict[str, Any] | None = None
    phone: str | None = None
    website: str | None = None
    wiki_q: str | None = None
    image_urls: list[str] = Field(default_factory=list)
    license: str | None = None
    attribution: str | None = None
    source_url: str | None = None
    embedding_synced: bool
    created_at: datetime
    updated_at: datetime
    last_seen_at: datetime

    model_config = {"from_attributes": True}


class SourceInfo(BaseModel):
    id: str
    title: str
    description: str
    requires_key: bool = False


class SourceRunOut(BaseModel):
    id: UUID
    source: str
    scope: str | None = None
    status: str
    started_at: datetime
    finished_at: datetime | None = None
    fetched: int = 0
    inserted: int = 0
    updated: int = 0
    skipped: int = 0
    errors: list[Any] = Field(default_factory=list)
    notes: str | None = None

    model_config = {"from_attributes": True}


class RunRequest(BaseModel):
    scope: str | None = Field(
        default=None,
        description="Опциональный аргумент для адаптера: код региона/города/страны.",
    )


class BootstrapStatus(BaseModel):
    bootstrapped: bool
    completed_at: datetime | None = None
    last_run_id: UUID | None = None
    notes: str | None = None


class StatsOut(BaseModel):
    total_places: int
    by_source: dict[str, int]
    by_country: dict[str, int]
    by_category: dict[str, int]
    embeddings_pending: int
