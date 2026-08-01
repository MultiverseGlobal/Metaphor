import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from pydantic import BaseModel

from app.database import get_session
from app.models.identity import User, Organization, OrganizationMember
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

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
async def read_user_me(current_user: User = Depends(get_current_user)) -> Any:
    return current_user
