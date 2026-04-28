from __future__ import annotations

import logging
import os
from typing import Any

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

log = logging.getLogger(__name__)

_scheduler: AsyncIOScheduler | None = None


def _job_runner_all() -> None:
    """Обёртка ПОД синхронный AP-Scheduler — он сам поймёт корутину."""
    from app.core.pipeline import run_all_sources

    return run_all_sources()  # AsyncIOScheduler корректно обработает coroutine


def _job_runner_reindex() -> None:
    from app.core.pipeline import reindex_pending

    return reindex_pending()


def start_scheduler() -> None:
    global _scheduler
    if _scheduler is not None:
        return
    if os.getenv("DATA_DISABLE_CRON", "false").lower() in {"1", "true", "yes"}:
        log.info("DATA_DISABLE_CRON set — scheduler not started")
        return

    _scheduler = AsyncIOScheduler()
    weekly_cron = os.getenv("DATA_WEEKLY_CRON", "0 3 * * 0")  # Sun 03:00
    daily_reindex_cron = os.getenv("DATA_REINDEX_CRON", "30 4 * * *")
    try:
        _scheduler.add_job(
            _job_runner_all,
            CronTrigger.from_crontab(weekly_cron),
            id="weekly-run-all",
            replace_existing=True,
        )
        _scheduler.add_job(
            _job_runner_reindex,
            CronTrigger.from_crontab(daily_reindex_cron),
            id="daily-reindex",
            replace_existing=True,
        )
        _scheduler.start()
        log.info(
            "scheduler started (weekly_cron=%s, reindex_cron=%s)",
            weekly_cron,
            daily_reindex_cron,
        )
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
