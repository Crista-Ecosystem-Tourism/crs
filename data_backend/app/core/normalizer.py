"""Преобразование сырых данных источников в единую модель Place."""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any, Iterable

log = logging.getLogger(__name__)

_VALID_CATEGORIES = {
    "attraction",
    "restaurant",
    "hotel",
    "nature",
    "culture",
    "entertainment",
    "shopping",
    "transport",
    "event",
    "other",
}


@dataclass
class NormalizedPlace:
    source: str
    external_id: str
    name: str
    category: str
    lat: float
    lng: float
    alt_names: dict[str, str] = field(default_factory=dict)
    subcategory: str | None = None
    city: str | None = None
    region: str | None = None
    country: str | None = None
    description: str | None = None
    description_lang: str | None = None
    tags: dict[str, Any] = field(default_factory=dict)
    rating: float | None = None
    hours: dict[str, Any] | None = None
    phone: str | None = None
    website: str | None = None
    wiki_q: str | None = None
    image_urls: list[str] = field(default_factory=list)
    license: str | None = None
    attribution: str | None = None
    source_url: str | None = None

    def __post_init__(self) -> None:
        if self.category not in _VALID_CATEGORIES:
            self.category = "other"
        self.name = (self.name or "").strip()
        if self.country:
            self.country = self.country.upper()[:8]
        if self.image_urls:
            seen: set[str] = set()
            cleaned: list[str] = []
            for url in self.image_urls:
                if url and url not in seen:
                    seen.add(url)
                    cleaned.append(url)
            self.image_urls = cleaned


def osm_category(tags: dict[str, Any]) -> tuple[str, str | None]:
    """Маппинг OSM-тегов в категорию + субкатегорию.

    Возвращает (category, subcategory).
    """

    tourism = tags.get("tourism")
    amenity = tags.get("amenity")
    historic = tags.get("historic")
    leisure = tags.get("leisure")
    natural = tags.get("natural")

    if tourism in {"hotel", "motel", "hostel", "guest_house", "apartment", "chalet", "camp_site"}:
        return "hotel", tourism
    if tourism in {"museum", "gallery", "artwork", "theme_park", "zoo", "aquarium"}:
        return "culture", tourism
    if tourism in {"attraction", "viewpoint", "information", "picnic_site"}:
        return "attraction", tourism

    if historic:
        return "culture", str(historic)

    if amenity in {"restaurant", "cafe", "bar", "pub", "fast_food", "biergarten", "food_court", "ice_cream"}:
        return "restaurant", amenity
    if amenity in {"theatre", "cinema", "arts_centre", "library", "place_of_worship"}:
        return "culture", amenity
    if amenity in {"nightclub"}:
        return "entertainment", amenity

    if leisure in {"park", "garden", "nature_reserve"}:
        return "nature", leisure
    if leisure in {"water_park", "amusement_arcade"}:
        return "entertainment", leisure

    if natural in {"peak", "waterfall", "spring", "cave_entrance", "beach", "volcano", "hot_spring"}:
        return "nature", natural

    return "other", None


def osm_to_place(element: dict[str, Any], region_hint: str | None = None) -> NormalizedPlace | None:
    tags = element.get("tags") or {}
    if not tags:
        return None

    name = (
        tags.get("name:ru")
        or tags.get("int_name")
        or tags.get("name:en")
        or tags.get("name")
    )
    if not name:
        return None

    osm_id = element.get("id")
    osm_type = element.get("type") or "node"
    if osm_id is None:
        return None

    if "lat" in element and "lon" in element:
        lat, lng = float(element["lat"]), float(element["lon"])
    elif "center" in element:
        lat, lng = float(element["center"]["lat"]), float(element["center"]["lon"])
    else:
        return None

    category, subcategory = osm_category(tags)

    alt_names: dict[str, str] = {}
    for key, value in tags.items():
        if key.startswith("name:") and isinstance(value, str):
            lang = key.split(":", 1)[1]
            alt_names[lang] = value

    description = tags.get("description") or tags.get("description:ru")
    description_lang = "ru" if (tags.get("description:ru") or tags.get("name:ru")) else None

    hours = None
    if tags.get("opening_hours"):
        hours = {"opening_hours": tags["opening_hours"]}

    image_urls: list[str] = []
    if tags.get("image"):
        image_urls.append(str(tags["image"]))
    if tags.get("wikimedia_commons"):
        commons = str(tags["wikimedia_commons"])
        if commons.startswith("File:"):
            image_urls.append(
                "https://commons.wikimedia.org/wiki/Special:FilePath/"
                + commons.removeprefix("File:").replace(" ", "_")
            )

    wiki_q = tags.get("wikidata") if isinstance(tags.get("wikidata"), str) else None

    return NormalizedPlace(
        source="osm",
        external_id=f"{osm_type}/{osm_id}",
        name=str(name),
        category=category,
        subcategory=subcategory,
        lat=lat,
        lng=lng,
        alt_names=alt_names,
        city=tags.get("addr:city"),
        region=region_hint,
        country=(tags.get("addr:country") or "").upper() or None,
        description=description if isinstance(description, str) else None,
        description_lang=description_lang,
        tags={k: v for k, v in tags.items() if isinstance(v, (str, int, float, bool))},
        phone=tags.get("contact:phone") or tags.get("phone"),
        website=tags.get("contact:website") or tags.get("website"),
        wiki_q=wiki_q,
        image_urls=image_urls,
        license="ODbL",
        attribution="© OpenStreetMap contributors",
        source_url=f"https://www.openstreetmap.org/{osm_type}/{osm_id}",
    )


def kudago_to_place(item: dict[str, Any]) -> NormalizedPlace | None:
    """Адаптация события KudaGo (или места) в единую модель."""

    coords = item.get("coords") or {}
    lat = coords.get("lat")
    lng = coords.get("lon")
    if lat is None or lng is None:
        return None

    title = item.get("title") or item.get("short_title") or ""
    if not title:
        return None

    image_urls = []
    for image in item.get("images") or []:
        if isinstance(image, dict) and image.get("image"):
            image_urls.append(str(image["image"]))
        elif isinstance(image, str):
            image_urls.append(image)

    return NormalizedPlace(
        source="kudago",
        external_id=str(item.get("id") or item.get("slug") or title),
        name=str(title),
        category="event" if item.get("dates") else "culture",
        subcategory=item.get("subway") or None,
        lat=float(lat),
        lng=float(lng),
        city=str(item.get("location")) if item.get("location") else None,
        country="RU",
        description=item.get("description") or item.get("body_text"),
        description_lang="ru",
        image_urls=image_urls,
        license="CC-BY",
        attribution="KudaGo",
        source_url=item.get("site_url") or item.get("url"),
        tags={"slug": item.get("slug")} if item.get("slug") else {},
    )


def merge_wikidata_enrich(
    place: NormalizedPlace, wiki_data: dict[str, Any]
) -> NormalizedPlace:
    if not wiki_data:
        return place
    if not place.description and wiki_data.get("description"):
        place.description = str(wiki_data["description"])
        place.description_lang = "ru"
    if wiki_data.get("image"):
        place.image_urls = [str(wiki_data["image"]), *place.image_urls]
    if wiki_data.get("country") and not place.country:
        place.country = str(wiki_data["country"]).upper()[:8]
    return place


def deduplicate(places: Iterable[NormalizedPlace]) -> list[NormalizedPlace]:
    """Уникализация по (source, external_id) — на случай повторов в одном пакете."""

    by_key: dict[tuple[str, str], NormalizedPlace] = {}
    for p in places:
        key = (p.source, p.external_id)
        existing = by_key.get(key)
        if existing is None:
            by_key[key] = p
            continue
        # склеиваем, давая приоритет уже существующей записи и добавляя alt_names/images
        existing.alt_names.update(p.alt_names)
        existing.image_urls = list(dict.fromkeys([*existing.image_urls, *p.image_urls]))
    return list(by_key.values())
