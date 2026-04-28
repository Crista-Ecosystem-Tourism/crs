"""create data_backend tables

Revision ID: 0001_create_data_tables
Revises:
Create Date: 2026-04-28
"""
from __future__ import annotations

revision = "0001_create_data_tables"
down_revision = None
branch_labels = None
depends_on = None


from alembic import op


STATEMENTS: list[str] = [
    "CREATE EXTENSION IF NOT EXISTS pgcrypto",
    """
    CREATE TABLE IF NOT EXISTS data_place (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source          TEXT NOT NULL,
        external_id     TEXT NOT NULL,
        name            TEXT NOT NULL,
        alt_names       JSONB NOT NULL DEFAULT '{}'::jsonb,
        category        TEXT NOT NULL,
        subcategory     TEXT,
        city            TEXT,
        region          TEXT,
        country         TEXT,
        lat             DOUBLE PRECISION NOT NULL,
        lng             DOUBLE PRECISION NOT NULL,
        description     TEXT,
        description_lang TEXT,
        tags            JSONB NOT NULL DEFAULT '{}'::jsonb,
        rating          DOUBLE PRECISION,
        hours           JSONB,
        phone           TEXT,
        website         TEXT,
        wiki_q          TEXT,
        image_urls      JSONB NOT NULL DEFAULT '[]'::jsonb,
        license         TEXT,
        attribution     TEXT,
        source_url      TEXT,
        embedding_synced BOOLEAN NOT NULL DEFAULT FALSE,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT data_place_source_ext_uq UNIQUE (source, external_id)
    )
    """,
    "CREATE INDEX IF NOT EXISTS data_place_country_idx ON data_place (country)",
    "CREATE INDEX IF NOT EXISTS data_place_city_idx ON data_place (city)",
    "CREATE INDEX IF NOT EXISTS data_place_category_idx ON data_place (category)",
    "CREATE INDEX IF NOT EXISTS data_place_geo_idx ON data_place (lat, lng)",
    "CREATE INDEX IF NOT EXISTS data_place_wiki_idx ON data_place (wiki_q) WHERE wiki_q IS NOT NULL",
    "CREATE INDEX IF NOT EXISTS data_place_embedding_idx ON data_place (embedding_synced) WHERE embedding_synced = FALSE",
    """
    CREATE TABLE IF NOT EXISTS data_place_link (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        place_id        UUID NOT NULL REFERENCES data_place(id) ON DELETE CASCADE,
        linked_place_id UUID NOT NULL REFERENCES data_place(id) ON DELETE CASCADE,
        similarity      DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        reason          TEXT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT data_place_link_uq UNIQUE (place_id, linked_place_id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS data_source_run (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source          TEXT NOT NULL,
        scope           TEXT,
        status          TEXT NOT NULL,
        started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        finished_at     TIMESTAMPTZ,
        fetched         INTEGER NOT NULL DEFAULT 0,
        inserted        INTEGER NOT NULL DEFAULT 0,
        updated         INTEGER NOT NULL DEFAULT 0,
        skipped         INTEGER NOT NULL DEFAULT 0,
        errors          JSONB NOT NULL DEFAULT '[]'::jsonb,
        notes           TEXT
    )
    """,
    "CREATE INDEX IF NOT EXISTS data_source_run_started_idx ON data_source_run (started_at DESC)",
    "CREATE INDEX IF NOT EXISTS data_source_run_source_idx ON data_source_run (source, started_at DESC)",
    """
    CREATE TABLE IF NOT EXISTS data_bootstrap_state (
        id              SERIAL PRIMARY KEY,
        completed_at    TIMESTAMPTZ,
        last_run_id     UUID,
        notes           TEXT
    )
    """,
]


def upgrade() -> None:
    for stmt in STATEMENTS:
        op.execute(stmt.strip())


def downgrade() -> None:
    for stmt in (
        "DROP TABLE IF EXISTS data_bootstrap_state CASCADE",
        "DROP TABLE IF EXISTS data_source_run CASCADE",
        "DROP TABLE IF EXISTS data_place_link CASCADE",
        "DROP TABLE IF EXISTS data_place CASCADE",
    ):
        op.execute(stmt)
