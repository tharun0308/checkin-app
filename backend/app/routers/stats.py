"""
stats.py router — three read-only endpoints.

GET /stats/week   → days used this week vs. limit
GET /stats/month  → this month vs. last, optional monthly goal
GET /stats/streak → current and longest alcohol-free streaks
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.stats_service import (
    get_month_stats,
    get_streak_stats,
    get_week_stats,
)

from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/stats", tags=["stats"])


class WeekStatsOut(BaseModel):
    days_used: int
    limit: int
    week_start: str
    week_end: str


class MonthStatsOut(BaseModel):
    days_this_month: int
    days_last_month: int
    goal: int | None


class StreakStatsOut(BaseModel):
    current_streak_days: int
    longest_streak_days: int


@router.get("/week", response_model=WeekStatsOut)
def week_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_week_stats(db, user_id=current_user.id)


@router.get("/month", response_model=MonthStatsOut)
def month_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_month_stats(db, user_id=current_user.id)


@router.get("/streak", response_model=StreakStatsOut)
def streak_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_streak_stats(db, user_id=current_user.id)
