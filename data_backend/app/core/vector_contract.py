"""Stable normalized-place payload shared with vectorization."""
from __future__ import annotations

from typing import Any

from app.models import Place


def place_to_vector_record(place: Place) -> dict[str, Any]:
    """Serialize a normalized place for vectorization without losing compatibility fields."""
    desc = place.description or place.name
    text_parts = [
        place.name,
        place.category,
        place.subcategory or "",
        place.city or "",
        place.country or "",
        desc,
    ]
    page_content = ". ".join(part for part in text_parts if part)

    subcategories = [place.category]
    if place.subcategory and place.subcategory not in subcategories:
        subcategories.append(place.subcategory)

    return {
        "id": str(place.id),
        "external_id": place.external_id,
        "source": place.source,
        "name": place.name,
        "category": place.category,
        "subcategory": place.subcategory,
        "subcategories": subcategories,
        "subtype": [place.subcategory] if place.subcategory else [],
        "city": place.city,
        "region": place.region,
        "country": place.country,
        "addressObj": {
            "city": place.city or "",
            "state": place.region or "",
            "country": place.country or "",
        },
        "lat": place.lat,
        "lng": place.lng,
        "latitude": place.lat,
        "longitude": place.lng,
        "description": desc,
        "page_content": page_content,
        "tags": place.tags,
        "rating": place.rating,
        "numberOfReviews": None,
        "image": place.image_urls[0] if place.image_urls else None,
        "image_urls": place.image_urls,
        "website": place.website,
        "phone": place.phone,
        "license": place.license,
        "attribution": place.attribution,
        "source_url": place.source_url,
    }
