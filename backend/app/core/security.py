from datetime import datetime, timedelta
from typing import Optional, Any, Union
import uuid
import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from app.core.config import settings
from app.database import get_session
from app.models.identity import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_session)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = await session.get(User, user_id)
    if user is None:
        raise credentials_exception
    return user


async def get_user_via_api_key(request: Request, session: AsyncSession = Depends(get_session)) -> User:
    """
    Accepts either a Bearer JWT (Authorization header) or an X-API-Key header.
    For API key auth, auto-creates/reuses a persistent dev user so the onboarding
    flow works without requiring a separate login step.
    """
    # 1. Try Bearer JWT first
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id:
                user = await session.get(User, uuid.UUID(user_id))
                if user:
                    return user
        except Exception:
            pass

    # 2. Fall back to X-API-Key
    api_key = request.headers.get("X-API-Key", "")
    if api_key and api_key == settings.METAPHOR_API_KEY:
        # Get or create a persistent dev/onboarding user
        from sqlmodel import select
        stmt = select(User).where(User.email == "dev@metaphor.local")
        result = await session.execute(stmt)
        user = result.scalars().first()
        if not user:
            user = User(
                email="dev@metaphor.local",
                hashed_password=get_password_hash("metaphor_dev_internal"),
                name="Metaphor Dev User"
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
        return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing API key / token",
        headers={"WWW-Authenticate": "Bearer"},
    )
