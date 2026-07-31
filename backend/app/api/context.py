from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from app.database.session import get_session
from app.services.context import ContextService
from app.services.graph import GraphService
from app.services.identity import IdentityService

router = APIRouter()

class ContextRequest(BaseModel):
    query: str
    ai_consumer: str = "claude"

@router.post("/query")
async def query_context(req: ContextRequest, db: AsyncSession = Depends(get_session)):
    identity = IdentityService(db)
    # Defaulting to dev org for V1 
    org = await identity.get_or_create_default_organization()
    
    graph = GraphService(db)
    context = ContextService(db, graph)
    
    # Context Sessions: Get delta updates rather than the whole graph!
    package = await context.generate_context_package(org.id, req.ai_consumer, req.query)
    
    return package.package_json
