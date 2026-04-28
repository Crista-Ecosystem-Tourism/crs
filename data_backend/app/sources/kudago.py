"""KudaGo: открытый каталог событий и мест в РФ."""
from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from typing import Any

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import http_user_agent, kudago_endpoint
from app.core.normalizer import NormalizedPlace, kudago_to_place
from app.sources.base import BaseSource, FetchBatch

log = logging.getLogger(__name__)

KUDAGO_CITIES = ["msk", "spb", "nsk", "ekb", "kzn", "vbg", "smr", "krd", "sochi", "nnv"]
KUDAGO_PAGE_SIZE = 100


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=2, min=2, max=20))
async def _fetch_page(client: httpx.AsyncClient, url: str, params: dict[str, Any]) -> dict[str, Any]:
    response = await client.get(
        url,
        params=params,
        timeout=httpx.Timeout(30.0, read=120.0),
        headers={"User-Agent": http_user_agent()},
    )
    response.raise_for_status()
    return response.json()


class KudaGoSource(BaseSource):
    id = "kudago"
    title = "KudaGo (РФ события и места)"
    description = "Открытый REST по городам России: места и события без ключа."
    requires_key = False

    async def fetch(self, scope: str | None = None) -> AsyncIterator[FetchBatch]:
        cities = [scope] if scope else KUDAGO_CITIES
        async with httpx.AsyncClient() as client:
            for city in cities:
                async for batch in self._fetch_places(client, city):
                    yield batch

    async def _fetch_places(self, client: httpx.AsyncClient, city: str) -> AsyncIterator[FetchBatch]:
        url = f"{kudago_endpoint()}/places/"
        page = 1
        while True:
            try:
                payload = await _fetch_page(
                    client,
                    url,
                    {
                        "location": city,
                        "page_size": KUDAGO_PAGE_SIZE,
                        "page": page,
                        "fields": (
                            "id,slug,title,short_title,address,coords,subway,images,"
                            "site_url,description,body_text,location"
                        ),
                    },
                )
            except httpx.HTTPError as exc:
                log.warning("kudago city=%s page=%d failed: %s", city, page, exc)
                yield FetchBatch(errors=[{"city": city, "page": page, "error": str(exc)}])
                return

            results = payload.get("results") or []
            if not results:
                return

            normalized: list[NormalizedPlace] = []
            skipped = 0
            for raw in results:
                np = kudago_to_place(raw)
                if np is None:
                    skipped += 1
                    continue
                np.city = city
                normalized.append(np)

            yield FetchBatch(places=normalized, fetched=len(results), skipped=skipped)

            if not payload.get("next"):
                return
            page += 1
