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
    answer = await llm_service.query_llm(system_prompt)
    
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
    from app.models.graph import Node, ContextModel
    
    stmt = select(Node.type, func.count(Node.id)).where(Node.organization_id == org.id).group_by(Node.type)
    res = await db.execute(stmt)
    counts = dict(res.all())
    
    total_nodes = sum(counts.values())
    
    # Get custom models
    model_stmt = select(ContextModel).where(ContextModel.organization_id == org.id)
    model_res = await db.execute(model_stmt)
    custom_models = model_res.scalars().all()
    
    results = [
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
    
    for m in custom_models:
        # Calculate nodes based on types
        types = [t.strip().capitalize() for t in m.node_types.split(",")]
        m_nodes = sum(counts.get(t, 0) for t in types)
        
        results.append({
            "id": str(m.id),
            "name": m.name,
            "description": m.description,
            "nodes": m_nodes,
            "isDefault": m.is_default,
            "lastSync": "Active"
        })
        
    return results

class ContextModelCreate(BaseModel):
    name: str
    description: str
    node_types: str

@router.post("/models")
async def create_context_model(req: ContextModelCreate, current_user: User = Depends(get_user_via_api_key), db: AsyncSession = Depends(get_session)):
    identity = IdentityService(db)
    org = await identity.get_user_organization(current_user.id) or await identity.get_or_create_default_organization()
    
    from app.models.graph import ContextModel
    new_model = ContextModel(
        organization_id=org.id,
        name=req.name,
        description=req.description,
        node_types=req.node_types
    )
    db.add(new_model)
    await db.commit()
    await db.refresh(new_model)
    
    return {
        "id": str(new_model.id),
        "name": new_model.name,
        "description": new_model.description,
        "nodes": 0,
        "isDefault": new_model.is_default,
        "lastSync": "Just now"
    }

@router.post("/lore")
async def build_lore(req: LoreRequest, current_user: User = Depends(get_user_via_api_key), db: AsyncSession = Depends(get_session)):
    print("ENTER BUILD LORE")
    try:
        identity = IdentityService(db)
        org = await identity.get_user_organization(current_user.id) or await identity.get_or_create_default_organization()
        print("ORG:", org.id)
        
        graph = GraphService(db)
        reflection = ReflectionService(graph)
        
        event = WebhookEvent(
            provider="metaphor_onboarding",
            event_type="context_setup",
            payload={
                "content": req.content,
                "url": getattr(req, "url", None) or "app://onboarding"
            }
        )
    
        print("CALLING REFLECT AND EVOLVE")
        try:
            result = await reflection.reflect_and_evolve(org.id, event)
            print("RESULT:", result)
            return result
        except Exception as e:
            print("EXCEPTION IN REFLECT AND EVOLVE:", e)
            import traceback
            traceback.print_exc()
            raise e
    except Exception as e:
        print("EXCEPTION IN BUILD LORE:", e)
        import traceback
        traceback.print_exc()
        raise

@router.post("/generate-ambiguities")
async def generate_ambiguities(db: AsyncSession = Depends(get_session)):
    """
    Uses the Structural Clarification Engine to analyze the indexed graph 
    and return <= 3 high-impact structural questions.
    """
    from app.services.clarification import ClarificationEngine
    
    identity = IdentityService(db)
    org = await identity.get_or_create_default_organization()
    
    clarification_engine = ClarificationEngine(db)
    questions = await clarification_engine.generate_clarification_questions(org.id)
    
    return {"questions": questions}
