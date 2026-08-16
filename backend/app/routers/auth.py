from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

class SignupRequest(BaseModel):
    name: str
    phone_number: str
    email: str
    password: str

class VerifySignupRequest(BaseModel):
    phone_number: str
    code: str

class LoginRequest(BaseModel):
    identifier: str
    password: str

@router.post("/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    code = auth_service.request_signup_otp(
        db=db, 
        phone_number=req.phone_number,
        name=req.name,
        email=req.email,
        password=req.password
    )
    print(f"\n\n=== MOCK SMS: OTP for {req.phone_number} is {code} ===\n\n")
    return {"message": "OTP sent", "mock_otp": code}

@router.post("/verify-signup")
def verify_signup(req: VerifySignupRequest, db: Session = Depends(get_db)):
    token = auth_service.verify_signup_otp(db=db, phone_number=req.phone_number, code=req.code)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    token = auth_service.login_user(db=db, identifier=req.identifier, password=req.password)
    return {"access_token": token, "token_type": "bearer"}
