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
    Scrapes connected data sources and generates dynamic questions.
    Because onboarding happens before a user is fully authenticated (they register at the end), 
    we query the default org's integrations.
    """
    from sqlmodel import select
    from app.models.operations import Integration
    import httpx
    
    identity = IdentityService(db)
    org = await identity.get_or_create_default_organization()
    
    stmt = select(Integration).where(Integration.organization_id == org.id)
    res = await db.execute(stmt)
    integrations = res.scalars().all()
    
    samples = []
    
    for integ in integrations:
        if integ.provider == "github" and integ.access_token:
            # Attempt real fetch
            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(
                        "https://api.github.com/user/repos?sort=updated&per_page=3",
                        headers={"Authorization": f"Bearer {integ.access_token}", "Accept": "application/vnd.github.v3+json"}
                    )
                    if resp.status_code == 200:
                        repos = resp.json()
                        for r in repos:
                            samples.append(f"GitHub Repo: {r.get('name')} - {r.get('description', '')}")
            except Exception as e:
                pass
                
        elif integ.provider == "notion" and integ.access_token:
            # Attempt real fetch
            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.post(
                        "https://api.notion.com/v1/search",
                        headers={
                            "Authorization": f"Bearer {integ.access_token}", 
                            "Notion-Version": "2022-06-28"
                        },
                        json={"page_size": 3, "sort": {"direction": "descending", "timestamp": "last_edited_time"}}
                    )
                    if resp.status_code == 200:
                        pages = resp.json().get("results", [])
                        for p in pages:
                            title = "Untitled"
                            try:
                                title = p["properties"]["title"]["title"][0]["plain_text"]
                            except:
                                pass
                            samples.append(f"Notion Page: {title}")
            except Exception as e:
                pass

    if not samples:
        # Fallback if no real data could be scraped
        samples = [
            "GitHub Repo: atlas-core - Core infrastructure for Atlas platform.",
            "GitHub Repo: metaphor-os - Next-gen context engine.",
            "Notion Page: Q3 Roadmap & OKRs - Focus on integrating AI models into the workspace."
        ]
        
    graph = GraphService(db)
    reflection = ReflectionService(graph)
    questions = await reflection.generate_ambiguities(samples)
    
    return {"questions": questions}
