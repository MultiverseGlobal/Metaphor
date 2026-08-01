from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from app.database.session import get_session
from app.services.context import ContextService
from app.services.graph import GraphService
from app.services.identity import IdentityService
from app.services.reflection import ReflectionService
from app.core.security import get_current_user
from app.models.identity import User
from app.models.operations import WebhookEvent

router = APIRouter()

class ContextRequest(BaseModel):
    query: str
    ai_consumer: str = "claude"

class LoreRequest(BaseModel):
    mission: str
    projects: str
    constraints: str
    preferences: str

@router.post("/query")
async def query_context(req: ContextRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_session)):
    identity = IdentityService(db)
    org = await identity.get_user_organization(current_user.id) or await identity.get_or_create_default_organization()
    
    graph = GraphService(db)
    context = ContextService(db, graph)
    
    package = await context.generate_context_package(org.id, req.ai_consumer, req.query)
    return package.package_json

@router.post("/lore")
async def build_lore(req: LoreRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_session)):
    identity = IdentityService(db)
    org = await identity.get_user_organization(current_user.id) or await identity.get_or_create_default_organization()
    
    graph = GraphService(db)
    reflection = ReflectionService(graph)
    
    event = WebhookEvent(
        provider="metaphor_onboarding",
        event_type="lore_builder",
        payload={
            "mission": req.mission,
            "projects": req.projects,
            "constraints": req.constraints,
            "preferences": req.preferences,
            "url": "app://onboarding"
        }
    )
    
    result = await reflection.reflect_and_evolve(org.id, event)
    return result
