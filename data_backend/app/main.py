from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import bootstrap, places, runs, sources, stats
from app.config import auto_bootstrap_enabled, get_cors_origins
from app.db import dispose_engine
from app.jobs.scheduler import start_scheduler, stop_scheduler

log = logging.getLogger("data_backend")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-7s %(name)s | %(message)s",
)


app = FastAPI(title="Crista Data Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _on_startup() -> None:
    log.info("data_backend starting")
    start_scheduler()
    if auto_bootstrap_enabled():
        log.info("DATA_AUTO_BOOTSTRAP=true — попытка автозапуска bootstrap")
        try:
            from app.core.pipeline import maybe_auto_bootstrap

            await maybe_auto_bootstrap()
        except Exception as exc:  # noqa: BLE001
            log.exception("auto bootstrap failed: %s", exc)


@app.on_event("shutdown")
async def _on_shutdown() -> None:
    log.info("data_backend shutdown")
    stop_scheduler()
    await dispose_engine()


app.include_router(stats.router)
app.include_router(sources.router)
app.include_router(runs.router)
app.include_router(places.router)
app.include_router(bootstrap.router)


@app.get("/health")
async def health() -> dict[str, bool | str]:
    return {"ok": True, "service": "data_backend"}
