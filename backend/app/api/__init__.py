from fastapi import APIRouter
from .context import router as context_router
from .graph import router as graph_router

api_router = APIRouter()
api_router.include_router(context_router, prefix="/context", tags=["context"])
api_router.include_router(graph_router, prefix="/graph", tags=["graph"])
