from pydantic import BaseModel


class SettingsOut(BaseModel):
    weekly_limit: int
    monthly_goal: int | None
    name: str

    model_config = {"from_attributes": True}


class SettingsUpdate(BaseModel):
    weekly_limit: int | None = None
    monthly_goal: int | None = None
    name: str | None = None
