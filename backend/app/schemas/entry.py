from datetime import date, time, datetime
from pydantic import BaseModel


class EntryNoteBody(BaseModel):
    note: str | None = None


class EntryOut(BaseModel):
    id: int
    user_id: int
    entry_date: date
    entry_time: time
    note: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class PreviewResponse(BaseModel):
    week_days_used: int
    weekly_limit: int
    exceeds_limit: bool


class ConfirmResponse(BaseModel):
    entry: EntryOut
    week_days_used: int
    weekly_limit: int
    exceeds_limit: bool
