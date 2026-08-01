import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from pydantic import BaseModel

import secrets
from app.database import get_session
from app.models.identity import User, Organization, OrganizationMember
from app.models.operations import APIKey
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user, get_user_via_api_key
from app.services.identity import IdentityService

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserUpdateProfile(BaseModel):
    name: str
    mission_statement: str = None
    writing_style: str = None
    preferred_terms: str = None
    banned_terms: str = None

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=Token)
async def register_user(user_in: UserCreate, session: AsyncSession = Depends(get_session)) -> Any:
    # Check if user exists
    stmt = select(User).where(User.email == user_in.email)
    result = await session.execute(stmt)
    if result.scalars().first():
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # Create user
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        name=user_in.name
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    
    # Create default org
    org = Organization(
        name=f"{user.name}'s Workspace",
        slug=f"{user.name.lower().replace(' ', '-')}-{str(uuid.uuid4())[:8]}"
    )
    session.add(org)
    await session.commit()
    await session.refresh(org)
    
    # Link user as owner
    member = OrganizationMember(
        user_id=user.id,
        organization_id=org.id,
        role="owner"
    )
    session.add(member)
    await session.commit()
    
    # Generate token
    access_token = create_access_token(subject=str(user.id))
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/token", response_model=Token)
async def login_access_token(session: AsyncSession = Depends(get_session), form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    stmt = select(User).where(User.email == form_data.username)
    result = await session.execute(stmt)
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token = create_access_token(subject=str(user.id))
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def read_user_me(current_user: User = Depends(get_user_via_api_key)) -> Any:
    return current_user

@router.put("/me")
async def update_user_me(
    profile_in: UserUpdateProfile,
    current_user: User = Depends(get_user_via_api_key),
    db: AsyncSession = Depends(get_session)
) -> Any:
    current_user.name = profile_in.name
    current_user.mission_statement = profile_in.mission_statement
    current_user.writing_style = profile_in.writing_style
    current_user.preferred_terms = profile_in.preferred_terms
    current_user.banned_terms = profile_in.banned_terms
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.get("/apikeys")
async def get_apikeys(current_user: User = Depends(get_user_via_api_key), db: AsyncSession = Depends(get_session)) -> Any:
    identity = IdentityService(db)
    org = await identity.get_user_organization(current_user.id) or await identity.get_or_create_default_organization()
    
    stmt = select(APIKey).where(APIKey.organization_id == org.id)
    result = await db.execute(stmt)
    keys = result.scalars().all()
    
    return [
        {
            "id": str(k.id),
            "name": k.name,
            "last_used": k.last_used,
            "preview": f"...{k.hashed_key[-4:]}" if len(k.hashed_key) > 4 else "..."
        }
        for k in keys
    ]

@router.post("/apikeys")
async def create_apikey(current_user: User = Depends(get_user_via_api_key), db: AsyncSession = Depends(get_session)) -> Any:
    identity = IdentityService(db)
    org = await identity.get_user_organization(current_user.id) or await identity.get_or_create_default_organization()
    
    raw_token = f"metaphor_sk_{secrets.token_urlsafe(24)}"
    
    # We store the raw token directly in hashed_key for the MVP to keep it simple, 
    # but in a real app, you would hash it here.
    api_key = APIKey(
        organization_id=org.id,
        name=f"Generated Key {str(uuid.uuid4())[:4]}",
        hashed_key=raw_token
    )
    db.add(api_key)
    await db.commit()
    await db.refresh(api_key)
    
    return {
        "id": str(api_key.id),
        "name": api_key.name,
        "raw_token": raw_token
    }
