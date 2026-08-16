"""
entries.py router — implements the two-step preview/confirm flow.

POST /entries/preview  — returns would-be week numbers, writes nothing
POST /entries/confirm  — saves the entry, returns same numbers (post-save)
GET  /entries          — list entries for a given month (for calendar view)
"""

from datetime import date, datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.entry import Entry
from app.schemas.entry import (
    ConfirmResponse,
    EntryNoteBody,
    EntryOut,
    PreviewResponse,
)
from app.services.stats_service import preview_week_after_checkin

from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/entries", tags=["entries"])


@router.post("/preview", response_model=PreviewResponse)
def preview_checkin(
    body: EntryNoteBody = EntryNoteBody(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Compute what the week stats would look like after a new check-in.
    Nothing is written to the database.
    """
    result = preview_week_after_checkin(db, user_id=current_user.id)
    return PreviewResponse(**result)


@router.post("/confirm", response_model=ConfirmResponse)
def confirm_checkin(
    body: EntryNoteBody = EntryNoteBody(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Save the check-in and return post-save week stats.
    The entry is always saved — the app never blocks an honest log.
    """
    now = datetime.now()
    entry = Entry(
        user_id=current_user.id,
        entry_date=now.date(),
        entry_time=now.time().replace(microsecond=0),
        note=body.note,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    result = preview_week_after_checkin(db, user_id=current_user.id)
    return ConfirmResponse(entry=EntryOut.model_validate(entry), **result)


@router.get("", response_model=list[EntryOut])
def list_entries(
    month: str = Query(..., description="YYYY-MM format, e.g. 2024-03"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return all entries for the given calendar month.
    Used by the MonthCalendar component to render filled/empty day dots.
    """
    try:
        year, mon = map(int, month.split("-"))
    except ValueError:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="month must be YYYY-MM")

    start = date(year, mon, 1)
    # Last day of month
    if mon == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, mon + 1, 1)

    rows = (
        db.execute(
            select(Entry)
            .where(Entry.user_id == current_user.id)
            .where(Entry.entry_date >= start)
            .where(Entry.entry_date < end)
            .order_by(Entry.entry_date, Entry.entry_time)
        )
        .scalars()
        .all()
    )
    return rows
