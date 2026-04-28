"""Загрузка POI из OpenStreetMap через Overpass API.

Покрытие:
- Если scope=None — РФ (все 85 субъектов через ISO3166-2:RU-XX) + список топ-городов мира.
- Если scope='ru' — только Россия.
- Если scope='world' — только города мира.
- Если scope похож на 'RU-MOW', 'RU-77' и т.п. — один регион.
- Если scope похож на 'city:Bali' — конкретный город по справочнику.
"""
from __future__ import annotations

import asyncio
import json
import logging
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import http_user_agent, overpass_endpoint
from app.core.normalizer import NormalizedPlace, osm_to_place
from app.sources.base import BaseSource, FetchBatch

log = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parents[2] / "data"

# Категории, которые тащим из OSM — широкий «туристический» снимок.
# В одном запросе получаем все нужные теги одним union, чтобы экономить кредиты Overpass.
OSM_FILTERS = """
  node["tourism"](area.searchArea);
  way["tourism"](area.searchArea);
  node["amenity"~"^(restaurant|cafe|bar|pub|fast_food|biergarten|food_court|ice_cream|theatre|cinema|arts_centre|library|place_of_worship|nightclub)$"](area.searchArea);
  way["amenity"~"^(restaurant|cafe|bar|pub|fast_food|biergarten|food_court|ice_cream|theatre|cinema|arts_centre|library|place_of_worship|nightclub)$"](area.searchArea);
  node["historic"](area.searchArea);
  way["historic"](area.searchArea);
  node["leisure"~"^(park|garden|nature_reserve|water_park|amusement_arcade)$"](area.searchArea);
  way["leisure"~"^(park|garden|nature_reserve|water_park|amusement_arcade)$"](area.searchArea);
  node["natural"~"^(peak|waterfall|spring|cave_entrance|beach|volcano|hot_spring)$"](area.searchArea);
"""


def _build_query_for_iso(iso_code: str) -> str:
    return f"""
[out:json][timeout:600];
area["ISO3166-2"="{iso_code}"]->.searchArea;
(
{OSM_FILTERS}
);
out center tags 5000;
""".strip()


def _build_query_for_country(country: str) -> str:
    return f"""
[out:json][timeout:600];
area["ISO3166-1"="{country}"]->.searchArea;
(
{OSM_FILTERS}
);
out center tags 7000;
""".strip()


def _build_query_for_bbox(bbox: tuple[float, float, float, float]) -> str:
    south, west, north, east = bbox
    return f"""
[out:json][timeout:300];
(
  node["tourism"]({south},{west},{north},{east});
  way["tourism"]({south},{west},{north},{east});
  node["amenity"~"^(restaurant|cafe|bar|pub|fast_food|theatre|cinema|arts_centre|nightclub|place_of_worship)$"]({south},{west},{north},{east});
  way["amenity"~"^(restaurant|cafe|bar|pub|fast_food|theatre|cinema|arts_centre|nightclub|place_of_worship)$"]({south},{west},{north},{east});
  node["historic"]({south},{west},{north},{east});
  way["historic"]({south},{west},{north},{east});
  node["leisure"~"^(park|garden|nature_reserve)$"]({south},{west},{north},{east});
  way["leisure"~"^(park|garden|nature_reserve)$"]({south},{west},{north},{east});
  node["natural"~"^(peak|waterfall|spring|cave_entrance|beach)$"]({south},{west},{north},{east});
);
out center tags 5000;
""".strip()


def _city_bbox(lat: float, lng: float, radius_km: float) -> tuple[float, float, float, float]:
    delta = radius_km / 111.0
    return (lat - delta, lng - delta * 1.5, lat + delta, lng + delta * 1.5)


def _load_ru_regions() -> list[dict[str, Any]]:
    path = DATA_DIR / "ru_regions.json"
    if not path.exists():
        log.warning("ru_regions.json not found at %s", path)
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def _load_world_cities() -> list[dict[str, Any]]:
    path = DATA_DIR / "cities.json"
    if not path.exists():
        log.warning("cities.json not found at %s", path)
        return []
    return json.loads(path.read_text(encoding="utf-8"))


class OsmOverpassSource(BaseSource):
    id = "osm"
    title = "OpenStreetMap (Overpass API)"
    description = (
        "POI всего мира по тегам tourism/amenity/historic/leisure/natural. "
        "Свободные данные ODbL без квот; разумный rate-limit per-IP."
    )
    requires_key = False

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=4, min=4, max=120))
    async def _query(self, client: httpx.AsyncClient, query: str) -> list[dict[str, Any]]:
        response = await client.post(
            overpass_endpoint(),
            data={"data": query},
            headers={"User-Agent": http_user_agent()},
            timeout=httpx.Timeout(60.0, read=900.0),
        )
        response.raise_for_status()
        payload = response.json()
        return list(payload.get("elements") or [])

    async def fetch(self, scope: str | None = None) -> AsyncIterator[FetchBatch]:
        scope = (scope or "").strip()
        regions = _load_ru_regions()
        cities = _load_world_cities()

        async with httpx.AsyncClient() as client:
            if scope == "" or scope.lower() == "ru":
                for entry in regions:
                    iso = entry.get("iso")
                    if not iso:
                        continue
                    yield await self._fetch_region(client, entry)
                    await asyncio.sleep(2.0)
                if scope == "":
                    for city in cities:
                        if city.get("country_code", "RU").upper() == "RU":
                            continue
                        yield await self._fetch_city(client, city)
                        await asyncio.sleep(2.0)
                return

            if scope.lower() == "world":
                for city in cities:
                    if city.get("country_code", "RU").upper() == "RU":
                        continue
                    yield await self._fetch_city(client, city)
                    await asyncio.sleep(2.0)
                return

            if scope.upper().startswith("RU-"):
                entry = next((r for r in regions if r.get("iso") == scope.upper()), None)
                if entry is None:
                    yield FetchBatch(errors=[{"scope": scope, "error": "region_not_found"}])
                    return
                yield await self._fetch_region(client, entry)
                return

            if scope.lower().startswith("city:"):
                target = scope.split(":", 1)[1].lower()
                city = next((c for c in cities if c["name"].lower() == target), None)
                if city is None:
                    yield FetchBatch(errors=[{"scope": scope, "error": "city_not_found"}])
                    return
                yield await self._fetch_city(client, city)
                return

            yield FetchBatch(errors=[{"scope": scope, "error": "unknown_scope"}])

    async def _fetch_region(self, client: httpx.AsyncClient, entry: dict[str, Any]) -> FetchBatch:
        iso = entry["iso"]
        log.info("OSM RU region %s (%s)", iso, entry.get("name"))
        try:
            elements = await self._query(client, _build_query_for_iso(iso))
        except httpx.HTTPError as exc:
            log.warning("OSM region %s failed: %s", iso, exc)
            return FetchBatch(errors=[{"scope": iso, "error": str(exc)}])
        return self._normalize_elements(elements, region_hint=entry.get("name"))

    async def _fetch_city(self, client: httpx.AsyncClient, city: dict[str, Any]) -> FetchBatch:
        bbox = _city_bbox(city["lat"], city["lng"], city.get("radius_km", 30))
        log.info("OSM city %s bbox=%s", city["name"], bbox)
        try:
            elements = await self._query(client, _build_query_for_bbox(bbox))
        except httpx.HTTPError as exc:
            log.warning("OSM city %s failed: %s", city["name"], exc)
            return FetchBatch(errors=[{"city": city["name"], "error": str(exc)}])
        return self._normalize_elements(elements, region_hint=city["name"])

    def _normalize_elements(
        self, elements: list[dict[str, Any]], region_hint: str | None = None
    ) -> FetchBatch:
        places: list[NormalizedPlace] = []
        skipped = 0
        for el in elements:
            normalized = osm_to_place(el, region_hint=region_hint)
            if normalized is None:
                skipped += 1
                continue
            places.append(normalized)
        return FetchBatch(places=places, fetched=len(elements), skipped=skipped)
