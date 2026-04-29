from __future__ import annotations

import logging
import os
from typing import Any

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

log = logging.getLogger(__name__)

_scheduler: AsyncIOScheduler | None = None


def _job_runner_etl_then_reindex() -> Any:
    """Полный ETL, затем reindex Chroma — без жёсткого интервала между задачами (прод + локалка)."""

    from app.core.pipeline import reindex_pending, run_all_sources

    async def _run() -> None:
        log.info("cron: weekly ETL start")
        try:
            results = await run_all_sources()
            log.info("cron: weekly ETL finished (%d source runs)", len(results))
        except Exception:  # noqa: BLE001
            log.exception("cron: weekly ETL failed — продолжаю reindex для уже загруженных строк")
        log.info("cron: reindex_pending start")
        try:
            out = await reindex_pending()
            log.info("cron: reindex_pending finished: %s", out)
        except Exception:  # noqa: BLE001
            log.exception("cron: reindex_pending failed")

    return _run()


def start_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        return
    if os.getenv("DATA_DISABLE_CRON", "false").lower() in {"1", "true", "yes"}:
        log.info("DATA_DISABLE_CRON set — scheduler not started")
        return

    _scheduler = AsyncIOScheduler()
    # Пн 00:01 UTC: полный ETL, затем сразу reindex (reindex только после окончания ETL по времени).
    weekly_cron = os.getenv("DATA_WEEKLY_CRON", "1 0 * * 1")
    try:
        _scheduler.add_job(
            _job_runner_etl_then_reindex,
            CronTrigger.from_crontab(weekly_cron),
            id="weekly-etl-then-reindex",
            replace_existing=True,
        )
        _scheduler.start()
        log.info("scheduler started (weekly_cron=%s, job=etl_then_reindex)", weekly_cron)
    except Exception as exc:  # noqa: BLE001
        log.exception("scheduler failed to start: %s", exc)


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler is None:
        return
    try:
        _scheduler.shutdown(wait=False)
    except Exception:  # noqa: BLE001
        pass
    finally:
        _scheduler = None
