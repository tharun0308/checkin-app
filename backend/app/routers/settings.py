"""
settings.py router — GET and PUT for the user's limit, goal, and display name.
Auto-saves on every PUT so the frontend doesn't need a separate save step.
"""


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.settings import Settings
from app.models.user import User
from app.schemas.settings import SettingsOut, SettingsUpdate

from app.dependencies import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])

def _get_or_create(db: Session, user: User) -> tuple[User, Settings]:
    s = db.execute(select(Settings).where(Settings.user_id == user.id)).scalar_one_or_none()
    if not s:
        s = Settings(user_id=user.id, weekly_limit=3, monthly_goal=None)
        db.add(s)
        db.commit()
        db.refresh(s)
    return user, s


@router.get("", response_model=SettingsOut)
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user, s = _get_or_create(db, current_user)
    return SettingsOut(
        weekly_limit=s.weekly_limit,
        monthly_goal=s.monthly_goal,
        name=user.name,
    )


@router.put("", response_model=SettingsOut)
def update_settings(body: SettingsUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user, s = _get_or_create(db, current_user)

    # weekly_limit: only update if explicitly provided
    if body.weekly_limit is not None:
        s.weekly_limit = body.weekly_limit
    # monthly_goal: update if the field was explicitly included in the request body
    # (allows setting to null to clear the goal)
    if "monthly_goal" in body.model_fields_set:
        s.monthly_goal = body.monthly_goal
    if body.name is not None:
        user.name = body.name

    db.commit()
    db.refresh(s)
    db.refresh(user)

    return SettingsOut(
        weekly_limit=s.weekly_limit,
        monthly_goal=s.monthly_goal,
        name=user.name,
    )
