"""
warning_service.py — thin wrapper around stats_service.preview_week_after_checkin.

The warning is triggered ONLY when the new check-in would push days_used OVER
the limit (i.e. exceeds_limit is True). If the user is already over the limit
for this week, we still warn — honesty is always encouraged, never punished.
"""

from sqlalchemy.orm import Session

from app.services.stats_service import preview_week_after_checkin


def evaluate_checkin(db: Session, user_id: int) -> dict:
    """
    Return the preview dict.  The router uses `exceeds_limit` to decide
    whether to surface the WarningModal on the frontend.
    """
    return preview_week_after_checkin(db, user_id)
