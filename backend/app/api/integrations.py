import asyncio
import logging
import jwt
import httpx
import urllib.parse
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from app.database.session import get_session
from app.core.security import get_user_via_api_key
from app.models.identity import User
from app.services.reflection import ReflectionService
from app.services.integrations.github import fetch_public_repository
from app.services.integrations.notion import fetch_notion_mockup

router = APIRouter()
logger = logging.getLogger(__name__)

class IntegrationSyncRequest(BaseModel):
    sources: List[str]
    github_repo: Optional[str] = "tiangolo/fastapi"  # default for demo
    github_token: Optional[str] = None
    notion_token: Optional[str] = None

async def process_integration_sync(
    user_id: str,
    org_id: str,
    sources: List[str],
    github_repo: str,
    github_token: Optional[str] = None,
    notion_token: Optional[str] = None
):
    """
    Background task that fetches data from the requested sources and feeds it into the Knowledge Graph.
    """
    try:
        combined_content = f"User {user_id} has connected the following sources: {', '.join(sources)}.\n\n"
        
        # Initialize an isolated DB session for the background task
        from app.database.session import get_session_context
        from sqlmodel import select
        from app.models.operations import Integration
        import uuid
        
        async with get_session_context() as session:
            # Look up tokens from the database if they were not provided via request
            if not github_token and "github" in sources:
                stmt = select(Integration).where(Integration.organization_id == uuid.UUID(org_id), Integration.provider == "github")
                res = await session.execute(stmt)
                integ = res.scalars().first()
                if integ and integ.access_token:
                    github_token = integ.access_token
                    
            if not notion_token and "notion" in sources:
                stmt = select(Integration).where(Integration.organization_id == uuid.UUID(org_id), Integration.provider == "notion")
                res = await session.execute(stmt)
                integ = res.scalars().first()
                if integ and integ.access_token:
                    notion_token = integ.access_token
                    
            if "github" in sources:
                logger.info(f"Fetching GitHub repo: {github_repo}")
                github_content = await fetch_public_repository(github_repo, github_token)
                combined_content += github_content + "\n\n"
                
            if "notion" in sources:
                logger.info("Fetching Notion mockup")
                notion_content = await fetch_notion_mockup()
                combined_content += notion_content + "\n\n"
            
            from app.services.graph import GraphService
            from app.models.operations import WebhookEvent
            
            graph = GraphService(session)
            reflection_service = ReflectionService(graph)
            
            event = WebhookEvent(
                organization_id=uuid.UUID(org_id),
                provider="metaphor_onboarding",
                event_type="initial_sync",
                payload={"content": combined_content}
            )
            
            # Feed into graph
            await reflection_service.reflect_and_evolve(
                org_id=uuid.UUID(org_id),
                event=event
            )
            logger.info(f"Integration sync completed successfully for user {user_id}")
            
    except Exception as e:
        logger.error(f"Integration sync failed: {e}")

@router.post("/sync")
async def trigger_integration_sync(
    request: IntegrationSyncRequest,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_user_via_api_key),
    session: AsyncSession = Depends(get_session)
):
    """
    Triggers an asynchronous synchronization of connected integrations.
    Returns 202 Accepted immediately while the background task processes the data.
    """
    # Find the user's primary organization (for simplicity, just grab the first one)
    from sqlmodel import select
    from app.models.identity import OrganizationMember
    
    stmt = select(OrganizationMember).where(OrganizationMember.user_id == user.id)
    result = await session.execute(stmt)
    org_member = result.scalars().first()
    
    if not org_member:
        raise HTTPException(status_code=400, detail="User does not belong to an organization")
        
    org_id = str(org_member.organization_id)
    
    background_tasks.add_task(
        process_integration_sync,
        user_id=str(user.id),
        org_id=org_id,
        sources=request.sources,
        github_repo=request.github_repo,
        github_token=request.github_token,
        notion_token=request.notion_token
    )
    
    return {"status": "sync_started", "message": "Integration sync running in the background."}

@router.get("/status")
async def check_integration_status(
    user: User = Depends(get_user_via_api_key),
    session: AsyncSession = Depends(get_session)
):
    """
    Checks if there are any nodes in the graph for the user's primary organization.
    This serves as a polling endpoint to know if the background sync has completed.
    """
    from sqlmodel import select
    from app.models.identity import OrganizationMember
    from app.models.graph import Node
    
    stmt = select(OrganizationMember).where(OrganizationMember.user_id == user.id)
    result = await session.execute(stmt)
    org_member = result.scalars().first()
    
    if not org_member:
        return {"status": "no_org", "has_data": False}
        
    stmt_nodes = select(Node).where(Node.organization_id == org_member.organization_id).limit(1)
    result_nodes = await session.execute(stmt_nodes)
    node = result_nodes.scalars().first()
    
    return {
        "status": "completed" if node else "processing",
        "has_data": node is not None
    }

@router.get("/{provider}/authorize")
async def authorize_integration(
    provider: str,
    request: Request,
    user: User = Depends(get_user_via_api_key),
    session: AsyncSession = Depends(get_session)
):
    from app.models.identity import OrganizationMember
    from sqlmodel import select
    from app.core.config import settings
    
    stmt = select(OrganizationMember).where(OrganizationMember.user_id == user.id)
    result = await session.execute(stmt)
    org_member = result.scalars().first()
    
    if not org_member:
        raise HTTPException(status_code=400, detail="User does not belong to an organization")
        
    org_id = str(org_member.organization_id)
    
    # Create state token
    state_payload = {
        "org_id": org_id,
        "provider": provider,
        "exp": int(datetime.now(timezone.utc).timestamp()) + 3600
    }
    state_token = jwt.encode(state_payload, settings.SECRET_KEY, algorithm="HS256")
    
    base_url = str(request.base_url).rstrip('/')
    
    if provider == "github":
        client_id = settings.GITHUB_CLIENT_ID
        redirect_uri = f"{base_url}{settings.API_PREFIX}/integrations/github/callback"
        if not client_id:
            return {"url": f"{redirect_uri}?code=mock_code_github&state={state_token}"}
        auth_url = f"https://github.com/login/oauth/authorize?client_id={client_id}&redirect_uri={urllib.parse.quote(redirect_uri)}&state={state_token}&scope=repo"
        return {"url": auth_url}
        
    elif provider == "notion":
        client_id = settings.NOTION_CLIENT_ID
        redirect_uri = f"{base_url}{settings.API_PREFIX}/integrations/notion/callback"
        if not client_id:
            return {"url": f"{redirect_uri}?code=mock_code_notion&state={state_token}"}
        auth_url = f"https://api.notion.com/v1/oauth/authorize?client_id={client_id}&response_type=code&owner=user&redirect_uri={urllib.parse.quote(redirect_uri)}&state={state_token}"
        return {"url": auth_url}
        
    else:
        raise HTTPException(status_code=400, detail="Unsupported provider")


@router.get("/{provider}/callback")
async def integration_callback(
    provider: str,
    code: str,
    state: str,
    session: AsyncSession = Depends(get_session)
):
    from app.core.config import settings
    from sqlmodel import select
    from app.models.operations import Integration
    from fastapi.responses import RedirectResponse
    import base64
    
    try:
        payload = jwt.decode(state, settings.SECRET_KEY, algorithms=["HS256"])
        org_id = payload.get("org_id")
        if not org_id or payload.get("provider") != provider:
            raise ValueError("Invalid state payload")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid or expired state token")

    access_token = None
    
    async with httpx.AsyncClient() as client:
        if provider == "github":
            resp = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": "http://localhost:8000/api/v1/integrations/github/callback"
                },
                headers={"Accept": "application/json"}
            )
            if resp.status_code == 200:
                data = resp.json()
                access_token = data.get("access_token")
                
        elif provider == "notion":
            auth_str = f"{settings.NOTION_CLIENT_ID}:{settings.NOTION_CLIENT_SECRET}"
            b64_auth = base64.b64encode(auth_str.encode()).decode()
            resp = await client.post(
                "https://api.notion.com/v1/oauth/token",
                json={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": "http://localhost:8000/api/v1/integrations/notion/callback"
                },
                headers={
                    "Authorization": f"Basic {b64_auth}",
                    "Content-Type": "application/json"
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                access_token = data.get("access_token")

    if access_token:
        # Upsert integration
        stmt = select(Integration).where(
            Integration.organization_id == uuid.UUID(org_id),
            Integration.provider == provider
        )
        result = await session.execute(stmt)
        integration = result.scalars().first()
        
        if integration:
            integration.access_token = access_token
        else:
            integration = Integration(
                organization_id=uuid.UUID(org_id),
                provider=provider,
                access_token=access_token
            )
            session.add(integration)
            
        await session.commit()
        
    return RedirectResponse(url=f"http://localhost:3000/onboarding?success={provider}")
