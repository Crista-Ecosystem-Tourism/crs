"""Wikidata source.

1. Используется как enrich (по списку Q-id) в pipeline — функция enrich_with_wikidata.
2. Регистрируется как самостоятельный источник `wikidata`, но реальный pull-режим
   пока не реализован (Wikidata дамп слишком большой, чтобы тянуть в общем ETL).
   Источник возвращает пустой батч; оставлен в registry для будущей реализации.
"""
from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from typing import Any

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import http_user_agent, wikidata_endpoint
from app.sources.base import BaseSource, FetchBatch

log = logging.getLogger(__name__)


SPARQL_TEMPLATE = """
SELECT ?item ?itemLabel ?itemDescription ?image ?country WHERE {
  VALUES ?item { %s }
  OPTIONAL { ?item wdt:P18 ?image }
  OPTIONAL { ?item wdt:P17 ?country . ?country wdt:P297 ?countryCode . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ru,en". }
}
"""


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=4, min=4, max=60))
async def _query_sparql(values: list[str]) -> dict[str, Any]:
    statements = " ".join(f"wd:{q}" for q in values)
    sparql = SPARQL_TEMPLATE % statements
    async with httpx.AsyncClient(
        timeout=httpx.Timeout(60.0, read=120.0),
        headers={
            "Accept": "application/sparql-results+json",
            "User-Agent": http_user_agent(),
        },
    ) as client:
        response = await client.get(
            wikidata_endpoint(),
            params={"query": sparql, "format": "json"},
        )
        response.raise_for_status()
        return response.json()


async def enrich_with_wikidata(qids: list[str]) -> dict[str, dict[str, Any]]:
    qids = [q for q in dict.fromkeys(qids) if q and q.startswith("Q")]
    if not qids:
        return {}

    out: dict[str, dict[str, Any]] = {}
    for chunk_start in range(0, len(qids), 50):
        chunk = qids[chunk_start : chunk_start + 50]
        try:
            payload = await _query_sparql(chunk)
        except httpx.HTTPError as exc:
            log.warning("wikidata chunk failed: %s", exc)
            continue
        for binding in payload.get("results", {}).get("bindings", []):
            qid = (binding.get("item", {}).get("value") or "").rsplit("/", 1)[-1]
            if not qid:
                continue
            out[qid] = {
                "name": binding.get("itemLabel", {}).get("value"),
                "description": binding.get("itemDescription", {}).get("value"),
                "image": binding.get("image", {}).get("value"),
                "country": binding.get("country", {}).get("value", "").rsplit("/", 1)[-1] or None,
            }
    return out


class WikidataPullSource(BaseSource):
    id = "wikidata"
    title = "Wikidata (enrichment)"
    description = (
        "Используется на этапе enrich для всех POI, у которых есть тег wikidata=Q*. "
        "Самостоятельный pull пока не реализован — Wikidata-дамп слишком объёмный."
    )
    requires_key = False

    async def fetch(self, scope: str | None = None) -> AsyncIterator[FetchBatch]:
        log.info("wikidata pull skipped — enrichment-only mode")
        yield FetchBatch()
