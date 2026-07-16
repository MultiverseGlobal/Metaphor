import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routes.sync import router as sync_router
from app.routes.graph import router as graph_router
from app.routes.context import router as context_router

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("metaphor")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB on startup
    logger.info("Initializing Postgres + pgvector database...")
    try:
        await init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        # Note: In development we continue so app doesn't crash if Docker DB is not up yet
    yield
    # Cleanup if needed
    logger.info("Shutting down app lifespan.")

app = FastAPI(
    title=settings.APP_NAME,
    description="Metaphor is a Context Engine and World Modeling platform. It builds a continuously evolving model of your world and serves structured context to AI consumers like William, Atlas, and Weave.",
    version="1.1.0",
    lifespan=lifespan
)

# Enable CORS for frontend dashboard interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach routers
app.include_router(sync_router, prefix=settings.API_PREFIX, tags=["sync"])
app.include_router(graph_router, prefix=settings.API_PREFIX, tags=["graph"])
app.include_router(context_router, prefix=settings.API_PREFIX, tags=["context"])

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "status": "healthy",
        "description": "Metaphor builds a continuously evolving model of your world, enabling AI systems to reason over relationships, history, and context."
    }
