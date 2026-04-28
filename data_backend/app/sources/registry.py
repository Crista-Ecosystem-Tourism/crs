from __future__ import annotations

from app.sources.base import BaseSource
from app.sources.kudago import KudaGoSource
from app.sources.mkrf import MkrfSource
from app.sources.osm_overpass import OsmOverpassSource
from app.sources.wikidata import WikidataPullSource

_SOURCES: list[BaseSource] = [
    OsmOverpassSource(),
    WikidataPullSource(),
    MkrfSource(),
    KudaGoSource(),
]


def list_sources() -> list[BaseSource]:
    return list(_SOURCES)


def get_source(source_id: str) -> BaseSource:
    for src in _SOURCES:
        if src.id == source_id:
            return src
    raise KeyError(f"Источник {source_id!r} не зарегистрирован")
