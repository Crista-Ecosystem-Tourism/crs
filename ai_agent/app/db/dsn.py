"""Сборка DATABASE_URL.

Coolify не делает compose-level подстановку `${VAR}` внутри значений `environment:`,
поэтому склеенный в compose DSN с плейсхолдерами ломает asyncpg парсер.
Берём готовый DATABASE_URL только если он валиден, иначе собираем из частей.
"""
from __future__ import annotations

import os
from urllib.parse import quote


def _looks_like_template(value: str) -> bool:
    return "${" in value or value.strip() == ""


def build_database_url() -> str:
    raw = os.getenv("DATABASE_URL", "")
    if raw and not _looks_like_template(raw):
        return raw

    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "postgres123")
    host = os.getenv("POSTGRES_HOST", "postgres")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "crs_agent")
    driver = os.getenv("DATABASE_DRIVER", "postgresql+asyncpg")

    return f"{driver}://{quote(user, safe='')}:{quote(password, safe='')}@{host}:{port}/{db}"
