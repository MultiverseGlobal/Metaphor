from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from app.config import settings

# Create database engine
# If postgres is run locally, it maps to postgresql+asyncpg://postgres:postgrespassword@localhost:5432/metaphor
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

# Async session maker
async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def init_db() -> None:
    # We will use alembic for production migrations, 
    # but let's have a helper to create tables locally.
    async with engine.begin() as conn:
        # Create pgvector extension if not exists
        await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
