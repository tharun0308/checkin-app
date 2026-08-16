"""
stats_service.py — all business-logic calculations for streaks, week rollups, and month rollups.

Week boundary: Monday–Sunday (ISO weekday 1–7).
"Days used" = distinct calendar dates with at least one entry — never raw entry count.
Streak = consecutive alcohol-free days ending today (or the day before today if today
         already has an entry — meaning the streak is still intact through yesterday).
"""

from datetime import date, timedelta, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.entry import Entry
from app.models.settings import Settings


DEFAULT_USER_ID = 1


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _week_bounds(d: date) -> tuple[date, date]:
    """Return (monday, sunday) of the ISO week containing *d*."""
    monday = d - timedelta(days=d.weekday())  # weekday() 0=Mon
    sunday = monday + timedelta(days=6)
    return monday, sunday


def _distinct_days_in_range(db: Session, user_id: int, start: date, end: date) -> list[date]:
    """Return sorted list of distinct entry_dates between start and end (inclusive)."""
    rows = (
        db.execute(
            select(func.distinct(Entry.entry_date))
            .where(Entry.user_id == user_id)
            .where(Entry.entry_date >= start)
            .where(Entry.entry_date <= end)
            .order_by(Entry.entry_date)
        )
        .scalars()
        .all()
    )
    return [datetime.strptime(r, "%Y-%m-%d").date() if isinstance(r, str) else r for r in rows]


# ---------------------------------------------------------------------------
# Week stats
# ---------------------------------------------------------------------------

def get_week_stats(db: Session, user_id: int = DEFAULT_USER_ID) -> dict:
    today = date.today()
    monday, sunday = _week_bounds(today)

    s = db.execute(select(Settings).where(Settings.user_id == user_id)).scalar_one_or_none()
    limit = s.weekly_limit if s else 3

    days_used = len(_distinct_days_in_range(db, user_id, monday, sunday))

    return {
        "days_used": days_used,
        "limit": limit,
        "week_start": monday.isoformat(),
        "week_end": sunday.isoformat(),
    }


# ---------------------------------------------------------------------------
# Month stats
# ---------------------------------------------------------------------------

def get_month_stats(db: Session, user_id: int = DEFAULT_USER_ID) -> dict:
    today = date.today()
    # This month bounds
    month_start = today.replace(day=1)
    # Last month bounds
    last_month_end = month_start - timedelta(days=1)
    last_month_start = last_month_end.replace(day=1)

    s = db.execute(select(Settings).where(Settings.user_id == user_id)).scalar_one_or_none()
    goal = s.monthly_goal if s else None

    days_this_month = len(_distinct_days_in_range(db, user_id, month_start, today))
    days_last_month = len(_distinct_days_in_range(db, user_id, last_month_start, last_month_end))

    return {
        "days_this_month": days_this_month,
        "days_last_month": days_last_month,
        "goal": goal,
    }


# ---------------------------------------------------------------------------
# Streak stats
# ---------------------------------------------------------------------------

def get_streak_stats(db: Session, user_id: int = DEFAULT_USER_ID) -> dict:
    """
    Streak = consecutive alcohol-free days.

    If today already has an entry the streak calculation starts from yesterday
    (the streak is still considered 'in progress' — today hasn't ended yet).
    If today has no entry, start from today itself.

    We look backwards day-by-day until we find a day WITH an entry; the count
    of consecutive clean days is the current streak.

    Longest streak: iterate over entire date range of entry history, find the
    longest run of consecutive days WITHOUT an entry.
    """
    today = date.today()

    # All distinct dates with entries, sorted ascending
    all_entry_dates_q = (
        db.execute(
            select(func.distinct(Entry.entry_date))
            .where(Entry.user_id == user_id)
            .order_by(Entry.entry_date)
        )
        .scalars()
        .all()
    )
    entry_dates: set[date] = {
        datetime.strptime(d, "%Y-%m-%d").date() if isinstance(d, str) else d 
        for d in all_entry_dates_q
    }

    # -- Current streak --
    # Start counting backwards from today (or yesterday if today has an entry)
    anchor = today if today not in entry_dates else today - timedelta(days=1)
    current_streak = 0
    cursor = anchor
    while cursor not in entry_dates:
        current_streak += 1
        cursor -= timedelta(days=1)
        # Safety: don't go back further than 3 years
        if (anchor - cursor).days > 1095:
            break

    # -- Longest streak --
    # If there are no entries ever, the entire time since signup is a streak.
    # We cap history at 365 days for performance.
    if not entry_dates:
        longest_streak = current_streak
    else:
        first_entry = min(entry_dates)
        history_start = max(first_entry - timedelta(days=1), today - timedelta(days=365))

        longest = 0
        run = 0
        d = history_start
        end_d = today
        while d <= end_d:
            if d not in entry_dates:
                run += 1
                longest = max(longest, run)
            else:
                run = 0
            d += timedelta(days=1)
        longest_streak = longest

    return {
        "current_streak_days": current_streak,
        "longest_streak_days": longest_streak,
    }


# ---------------------------------------------------------------------------
# Preview helper (used by warning_service / entries router)
# ---------------------------------------------------------------------------

def preview_week_after_checkin(db: Session, user_id: int = DEFAULT_USER_ID) -> dict:
    """
    Compute what the week stats WOULD be if a new entry were added for today.
    Does NOT write anything to the database.
    """
    today = date.today()
    monday, sunday = _week_bounds(today)

    s = db.execute(select(Settings).where(Settings.user_id == user_id)).scalar_one_or_none()
    limit = s.weekly_limit if s else 3

    existing_days = set(_distinct_days_in_range(db, user_id, monday, sunday))
    # Adding today (distinct date)
    projected_days = existing_days | {today}
    week_days_used = len(projected_days)
    exceeds_limit = week_days_used > limit

    return {
        "week_days_used": week_days_used,
        "weekly_limit": limit,
        "exceeds_limit": exceeds_limit,
    }
