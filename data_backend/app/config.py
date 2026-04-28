from __future__ import annotations

import os
from urllib.parse import quote_plus


def get_database_url() -> str:
    raw = os.getenv("DATABASE_URL")
    if raw and raw.strip():
        return raw.strip()

    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "")
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    database = os.getenv("POSTGRES_DB", "crs_agent")

    u = quote_plus(user)
    p = quote_plus(password)
    auth = f"{u}:{p}@{host}" if password else f"{u}@{host}"
    return f"postgresql+asyncpg://{auth}:{port}/{database}"


def get_cors_origins() -> list[str]:
    default = (
        "http://localhost:3333,http://localhost:5173,http://127.0.0.1:5173,"
        "https://crista.online,https://www.crista.online,https://api.crista.online"
    )
    raw = (os.getenv("CORS_ORIGINS") or default).strip()
    seen: set[str] = set()
    origins: list[str] = []
    for item in raw.split(","):
        value = item.strip()
        if value and value not in seen:
            seen.add(value)
            origins.append(value)
    return origins


def get_vectorization_url() -> str:
    return os.getenv("VECTORIZATION_URL", "http://vectorization:8001").rstrip("/")


def get_seed_dir() -> str:
    return os.getenv("DATA_SEED_DIR", "/app/data/seed")


def auto_bootstrap_enabled() -> bool:
    return os.getenv("DATA_AUTO_BOOTSTRAP", "false").lower() in {"1", "true", "yes", "on"}


def overpass_endpoint() -> str:
    return os.getenv(
        "OVERPASS_ENDPOINT", "https://overpass-api.de/api/interpreter"
    ).rstrip("/")


def wikidata_endpoint() -> str:
    return os.getenv(
        "WIKIDATA_ENDPOINT", "https://query.wikidata.org/sparql"
    ).rstrip("/")


def kudago_endpoint() -> str:
    return os.getenv("KUDAGO_ENDPOINT", "https://kudago.com/public-api/v1.4").rstrip("/")


def mkrf_endpoint() -> str:
    return os.getenv(
        "MKRF_ENDPOINT", "https://opendata.mkrf.ru/v2/museums/$"
    ).rstrip("/")


def http_user_agent() -> str:
    return os.getenv(
        "DATA_USER_AGENT",
        "CristaDataBackend/1.0 (+https://crista.online; contact@crista.online)",
    )


def reindex_batch_size() -> int:
    try:
        return max(50, int(os.getenv("REINDEX_BATCH_SIZE", "500")))
    except ValueError:
        return 500


def admin_token() -> str | None:
    raw = os.getenv("DATA_ADMIN_TOKEN")
    return raw.strip() if raw and raw.strip() else None
