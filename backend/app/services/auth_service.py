from datetime import datetime, timedelta
import random
import string
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import bcrypt

from app.models.user import User
from app.models.otp import OtpCode

# Security configurations
SECRET_KEY = "super-secret-key-for-local-dev-only"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

def verify_password(plain_password, hashed_password):
    if not hashed_password:
        return False
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_user_from_token(db: Session, token: str) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


def request_signup_otp(db: Session, phone_number: str, name: str, email: str, password: str) -> str:
    # Check if phone number is already registered and verified
    user = db.query(User).filter(User.phone_number == phone_number).first()
    
    if user:
        if user.is_verified:
            raise HTTPException(status_code=400, detail="Phone number already registered")
        else:
            # Update unverified user
            user.name = name
            user.email = email
            user.password_hash = get_password_hash(password)
    else:
        # Create new unverified user
        user = User(
            phone_number=phone_number,
            name=name,
            email=email,
            password_hash=get_password_hash(password),
            is_verified=False
        )
        db.add(user)
        
    db.commit()
    
    # Generate OTP
    db.query(OtpCode).filter(OtpCode.phone_number == phone_number).delete()
    code = ''.join(random.choices(string.digits, k=4))
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    otp_record = OtpCode(phone_number=phone_number, code=code, expires_at=expires_at)
    db.add(otp_record)
    db.commit()
    
    return code

def verify_signup_otp(db: Session, phone_number: str, code: str) -> str:
    otp_record = db.query(OtpCode).filter(
        OtpCode.phone_number == phone_number,
        OtpCode.code == code,
        OtpCode.expires_at > datetime.utcnow()
    ).first()
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    user = db.query(User).filter(User.phone_number == phone_number).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(otp_record)
    user.is_verified = True
    db.commit()
    
    return create_access_token(data={"sub": str(user.id)})

def login_user(db: Session, identifier: str, password: str) -> str:
    # Identifier can be phone or email
    user = db.query(User).filter(
        (User.phone_number == identifier) | (User.email == identifier)
    ).first()
    
    if not user or not user.is_verified:
        raise HTTPException(status_code=401, detail="Invalid credentials or unverified account")
        
    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    return create_access_token(data={"sub": str(user.id)})
