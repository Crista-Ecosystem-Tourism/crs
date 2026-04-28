"""opendata.mkrf.ru — открытые данные министерства культуры РФ.

Реализован минимальный pull музеев. Если api недоступен/медленный — отдаём
пустой батч и не ломаем общий пайплайн.
"""
from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from typing import Any

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import http_user_agent
from app.core.normalizer import NormalizedPlace
from app.sources.base import BaseSource, FetchBatch

log = logging.getLogger(__name__)

MKRF_API = "https://opendata.mkrf.ru/v2"
PAGE_SIZE = 50


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=2, max=20))
async def _fetch_page(client: httpx.AsyncClient, dataset: str, page: int) -> dict[str, Any]:
    response = await client.get(
        f"{MKRF_API}/{dataset}/$",
        params={"l": PAGE_SIZE, "o": (page - 1) * PAGE_SIZE},
        timeout=httpx.Timeout(30.0, read=180.0),
        headers={"User-Agent": http_user_agent(), "Accept": "application/json"},
    )
    response.raise_for_status()
    return response.json()


class MkrfSource(BaseSource):
    id = "mkrf"
    title = "opendata.mkrf.ru"
    description = "Музеи РФ: открытые данные Министерства культуры."
    requires_key = False

    async def fetch(self, scope: str | None = None) -> AsyncIterator[FetchBatch]:
        dataset = scope or "museums"
        async with httpx.AsyncClient() as client:
            page = 1
            while True:
                try:
                    payload = await _fetch_page(client, dataset, page)
                except httpx.HTTPError as exc:
                    log.warning("mkrf dataset=%s page=%d failed: %s", dataset, page, exc)
                    yield FetchBatch(errors=[{"dataset": dataset, "page": page, "error": str(exc)}])
                    return

                items = payload.get("data") or []
                if not items:
                    return

                normalized: list[NormalizedPlace] = []
                skipped = 0
                for raw in items:
                    nuid = raw.get("nativeId") or raw.get("id")
                    data = raw.get("data") or {}
                    general = data.get("general") or {}
                    address = general.get("address") or {}
                    coords = general.get("locale") or {}
                    name = general.get("name") or general.get("title")
                    lat = coords.get("lat")
                    lng = coords.get("lng") or coords.get("lon")
                    if not (name and lat and lng):
                        skipped += 1
                        continue
                    normalized.append(
                        NormalizedPlace(
                            source="mkrf",
                            external_id=str(nuid),
                            name=str(name),
                            category="culture",
                            subcategory="museum",
                            lat=float(lat),
                            lng=float(lng),
                            city=address.get("fullAddress") or address.get("region"),
                            region=address.get("region"),
                            country="RU",
                            description=general.get("description"),
                            description_lang="ru",
                            license="OpenData",
                            attribution="Минкультуры РФ",
                            source_url=f"https://opendata.mkrf.ru/opendata/{nuid}",
                            tags={"dataset": dataset},
                        )
                    )

                yield FetchBatch(places=normalized, fetched=len(items), skipped=skipped)

                if len(items) < PAGE_SIZE:
                    return
                page += 1
