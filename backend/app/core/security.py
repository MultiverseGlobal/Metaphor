from datetime import datetime, timedelta
from typing import Optional, Any, Union
import uuid
import os
from cryptography.fernet import Fernet
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from supabase import create_client, Client

from app.core.config import settings
from app.database.session import get_session
from app.models.identity import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/token")

def get_supabase_client() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        raise ValueError("Supabase credentials are not set")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

supabase = get_supabase_client()

async def get_current_user(token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_session)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        user_res = supabase.auth.get_user(token)
        if not user_res or not user_res.user:
            raise credentials_exception
        user_id = user_res.user.id
    except Exception as e:
        raise credentials_exception
        
    user = await session.get(User, uuid.UUID(user_id))
    if user is None:
        # Create a user record if it doesn't exist
        email = user_res.user.email
        name = user_res.user.user_metadata.get("full_name") or user_res.user.user_metadata.get("name") or "Supabase User"
        user = User(
            id=uuid.UUID(user_id),
            email=email,
            hashed_password="", # No local password needed
            name=name
        )
        session.add(user)
        
        from app.models.identity import Organization, OrganizationMember
        org = Organization(name=f"{name}'s Workspace", slug=f"workspace-{user_id}")
        session.add(org)
        
        member = OrganizationMember(user_id=user.id, organization_id=org.id, role="owner")
        session.add(member)
        
        await session.commit()
        await session.refresh(user)
    return user


async def get_user_via_api_key(request: Request, session: AsyncSession = Depends(get_session)) -> User:
    """
    Accepts either a Bearer JWT (Authorization header) or an X-API-Key header.
    """
    # 1. Try Bearer JWT first
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        try:
            user_res = supabase.auth.get_user(token)
            if user_res and user_res.user:
                user = await session.get(User, uuid.UUID(user_res.user.id))
                if user:
                    return user
                else:
                    # Sync user to DB
                    name = user_res.user.user_metadata.get("full_name") or user_res.user.user_metadata.get("name") or "Supabase User"
                    new_user = User(
                        id=uuid.UUID(user_res.user.id),
                        email=user_res.user.email,
                        hashed_password="",
                        name=name
                    )
                    session.add(new_user)
                    
                    from app.models.identity import Organization, OrganizationMember
                    org = Organization(name=f"{name}'s Workspace", slug=f"workspace-{user_res.user.id}")
                    session.add(org)
                    
                    member = OrganizationMember(user_id=new_user.id, organization_id=org.id, role="owner")
                    session.add(member)
                    
                    await session.commit()
                    await session.refresh(new_user)
                    return new_user
        except Exception:
            pass

    # 2. Fall back to X-API-Key
    api_key = request.headers.get("X-API-Key", "")
    if api_key:
        import hashlib
        from sqlmodel import select
        
        # 2a. Check if it's a real generated API Key
        from app.models.operations import APIKey
        from app.models.identity import OrganizationMember
        
        hashed_api_key = hashlib.sha256(api_key.encode('utf-8')).hexdigest()
        
        stmt = select(APIKey).where(APIKey.hashed_key == hashed_api_key)
        result = await session.execute(stmt)
        db_key = result.scalars().first()
        
        if db_key:
            stmt = select(User).join(OrganizationMember).where(OrganizationMember.organization_id == db_key.organization_id)
            result = await session.execute(stmt)
            org_user = result.scalars().first()
            if org_user:
                return org_user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing API key / token",
        headers={"WWW-Authenticate": "Bearer"},
    )

_fernet = None

def get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        key = settings.ENCRYPTION_KEY
        if not key:
            raise ValueError("ENCRYPTION_KEY environment variable is not set. Token encryption requires it.")
        
        try:
            _fernet = Fernet(key.encode('utf-8'))
        except ValueError as e:
            raise ValueError(f"ENCRYPTION_KEY is invalid: {e}")
            
    return _fernet

def encrypt_token(token: str) -> str:
    if not token:
        return token
    f = get_fernet()
    return f.encrypt(token.encode('utf-8')).decode('utf-8')

def decrypt_token(encrypted_token: str) -> str:
    if not encrypted_token:
        return encrypted_token
    f = get_fernet()
    return f.decrypt(encrypted_token.encode('utf-8')).decode('utf-8')
