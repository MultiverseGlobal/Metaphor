from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from app.database.session import get_session
from app.services.context import ContextService
from app.services.graph import GraphService
from app.services.identity import IdentityService
from app.services.reflection import ReflectionService
from app.core.security import get_user_via_api_key
from app.models.identity import User
from app.models.operations import WebhookEvent
from app.services.llm import llm_service

router = APIRouter()

class ContextRequest(BaseModel):
    query: str
    ai_consumer: str = "claude"

class LoreRequest(BaseModel):
    content: str

class AnalyzeDraftRequest(BaseModel):
    answers: List[Dict[str, Any]]


@router.post("/query")
async def query_context(req: ContextRequest, current_user: User = Depends(get_user_via_api_key), db: AsyncSession = Depends(get_session)):
    identity = IdentityService(db)
    org = await identity.get_user_organization(current_user.id) or await identity.get_or_create_default_organization()
    
    graph = GraphService(db)
    context = ContextService(db, graph)
    
    package = await context.generate_context_package(org.id, req.ai_consumer, req.query)
    return package.package_json

@router.post("/analyze-draft")
async def analyze_draft(req: AnalyzeDraftRequest, current_user: User = Depends(get_user_via_api_key), db: AsyncSession = Depends(get_session)):
    graph = GraphService(db)
    reflection = ReflectionService(graph)
    result = await reflection.analyze_interview(req.answers)
    return result

@router.post("/chat")
async def chat_with_context(req: ContextRequest, current_user: User = Depends(get_user_via_api_key), db: AsyncSession = Depends(get_session)):
    """Powers the Playground UI by simulating a Consumer AI that uses Metaphor Context."""
    identity = IdentityService(db)
    org = await identity.get_user_organization(current_user.id) or await identity.get_or_create_default_organization()
    
    graph = GraphService(db)
    context = ContextService(db, graph)
    
    # 1. Pull the context package from Metaphor
    package = await context.generate_context_package(org.id, "playground", req.query)
    package_json = package.package_json
    
    # 2. Build a system prompt with the context
    system_prompt = f"""
    You are a smart Context Engine proxy. You are answering a user's question directly.
    You must strictly base your answers on the following contextual nodes retrieved from the user's graph:
    
    {package_json}
    
    User Query: {req.query}
    """
    
    # 3. Generate response using the underlying LLM Service
    answer = await llm_service.generate(system_prompt)
    
    return {
        "answer": answer,
        "context": package_json
    }

@router.get("/models")
async def get_context_models(current_user: User = Depends(get_user_via_api_key), db: AsyncSession = Depends(get_session)):
    """Returns active context models (partitions) and live metrics for the organization."""
    identity = IdentityService(db)
    org = await identity.get_user_organization(current_user.id) or await identity.get_or_create_default_organization()
    
    # Query node counts by type
    from sqlmodel import select, func
    from app.models.graph import Node
    
    stmt = select(Node.type, func.count(Node.id)).where(Node.organization_id == org.id).group_by(Node.type)
    res = await db.execute(stmt)
    counts = dict(res.all())
    
    total_nodes = sum(counts.values())
    
    return [
        {
            "id": "global",
            "name": "Global Identity",
            "description": "Your default primary context model. Applies to all generalized AI queries.",
            "nodes": total_nodes,
            "isDefault": True,
            "lastSync": "Just now"
        },
        {
            "id": "engineering",
            "name": "Software Engineering & Architecture",
            "description": "Strict technical context. Heavily weighted towards codebase constraints, decisions, and system design.",
            "nodes": counts.get("Project", 0) + counts.get("Constraint", 0),
            "isDefault": False,
            "lastSync": "Active"
        },
        {
            "id": "operations",
            "name": "Operations & Product Goals",
            "description": "Optimized for strategic planning. Focuses on active goals, roadmap items, and team commitments.",
            "nodes": counts.get("Goal", 0) + counts.get("Preference", 0),
            "isDefault": False,
            "lastSync": "Active"
        }
    ]

@router.post("/lore")
async def build_lore(req: LoreRequest, current_user: User = Depends(get_user_via_api_key), db: AsyncSession = Depends(get_session)):
    identity = IdentityService(db)
    org = await identity.get_user_organization(current_user.id) or await identity.get_or_create_default_organization()
    
    graph = GraphService(db)
    reflection = ReflectionService(graph)
    
    event = WebhookEvent(
        provider="metaphor_onboarding",
        event_type="context_setup",
        payload={
            "content": req.content,
            "url": "app://onboarding"
        }
    )
    
    result = await reflection.reflect_and_evolve(org.id, event)
    return result
