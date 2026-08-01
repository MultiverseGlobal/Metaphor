import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import traceback
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.core.config import settings
from app.api import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("metaphor")

@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.database.session import init_db
    try:
        await init_db()
        logger.info("Database tables initialized/verified.")
    except Exception as e:
        logger.error(f"Error initializing DB tables: {e}")
    from app.workers import resume_stuck_jobs
    import asyncio
    asyncio.create_task(resume_stuck_jobs())
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
