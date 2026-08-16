"""Make models importable from app.models"""
from app.models.user import User
from app.models.settings import Settings
from app.models.entry import Entry
from app.models.otp import OtpCode

__all__ = ["User", "Settings", "Entry", "OtpCode"]
