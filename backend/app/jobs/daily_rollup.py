"""
daily_rollup.py — optional background job placeholder.

In v1, all stats are computed on-the-fly from the entries table.
This module exists as the hook point for a future scheduled job
(e.g., via APScheduler or a cron on Render/Railway) that could:
  - Pre-aggregate monthly summaries into a dedicated table
  - Send push notifications if desired
  - Archive old entries

Run manually for testing:
    python -m app.jobs.daily_rollup
"""

import logging
from datetime import date

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.services.stats_service import get_streak_stats, get_week_stats

logger = logging.getLogger(__name__)


def run_rollup(db: Session) -> None:
    today = date.today()
    logger.info("Running daily rollup for %s", today)

    week = get_week_stats(db)
    streak = get_streak_stats(db)

    logger.info(
        "Week: %d/%d days used | Current streak: %d days | Longest: %d days",
        week["days_used"],
        week["limit"],
        streak["current_streak_days"],
        streak["longest_streak_days"],
    )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    db = SessionLocal()
    try:
        run_rollup(db)
    finally:
        db.close()
