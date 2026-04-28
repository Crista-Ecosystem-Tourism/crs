"""Заливка нормализованных мест в Chroma через сервис vectorization.

Стратегия: data_backend пишет JSON-файл со списком мест в shared volume,
а затем дёргает у `vectorization` существующий эндпоинт
``POST /api/v1/load/json?filepath=...``. Это позволяет не дублировать
логику эмбеддингов и не трогать `vectorization_backend`.
"""
from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

import httpx
from tenacity import RetryError, retry, stop_after_attempt, wait_exponential

from app.config import get_seed_dir, get_vectorization_url, http_user_agent

log = logging.getLogger(__name__)


def _seed_path(name: str | None = None) -> Path:
    base = Path(get_seed_dir())
    base.mkdir(parents=True, exist_ok=True)
    suffix = name or datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    return base / f"places_{suffix}.json"


def write_seed_file(records: Iterable[dict], suffix: str | None = None) -> Path:
    path = _seed_path(suffix)
    payload = list(records)
    path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    log.info("seed written: %s (%d records)", path, len(payload))
    return path


@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=2, min=2, max=30))
async def _post_load_json(filepath: str) -> dict:
    url = f"{get_vectorization_url()}/api/v1/load/json"
    timeout = httpx.Timeout(60.0, read=600.0)
    headers = {"User-Agent": http_user_agent()}
    async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
        response = await client.post(url, params={"filepath": filepath})
        response.raise_for_status()
        return response.json()


async def reindex_chroma(records: list[dict]) -> dict:
    if not records:
        return {"status": "noop", "count": 0}

    path = write_seed_file(records)
    try:
        result = await _post_load_json(str(path))
    except RetryError as exc:
        log.exception("vectorization unreachable: %s", exc)
        return {"status": "error", "message": str(exc), "count": len(records)}
    except httpx.HTTPError as exc:
        log.exception("vectorization HTTP error: %s", exc)
        return {"status": "error", "message": str(exc), "count": len(records)}

    return {"status": "ok", "count": len(records), "vectorization_response": result}


def cleanup_old_seeds(keep: int = 10) -> None:
    base = Path(get_seed_dir())
    if not base.exists():
        return
    files = sorted(base.glob("places_*.json"))
    for path in files[:-keep]:
        try:
            os.remove(path)
        except OSError:
            log.warning("cannot remove %s", path)
