import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.core.config import settings
from app.api import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("metaphor")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Database is initialized via reset_db script or alembic, skip automatic sync_all here in V2
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Metaphor is a Context Engine built on a Multi-Tenant Graph.",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(GZipMiddleware, minimum_size=500)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/")
async def root():
    return {"app": settings.APP_NAME, "status": "healthy", "version": "2.0.0"}
