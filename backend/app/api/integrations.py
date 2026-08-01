import asyncio
import logging
import jwt
import httpx
import urllib.parse
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from app.database.session import get_session
from app.core.security import get_user_via_api_key
from app.models.identity import User
from app.services.reflection import ReflectionService
from app.services.integrations.github import fetch_public_repository
from app.services.integrations.notion import fetch_notion_workspace
from app.services.integrations.linear import fetch_linear_workspace
from app.services.integrations.google import fetch_google_workspace

router = APIRouter()
logger = logging.getLogger(__name__)

class IntegrationSyncRequest(BaseModel):
    sources: List[str]
    github_repo: Optional[str] = "tiangolo/fastapi"  # default for demo
    github_token: Optional[str] = None
    notion_token: Optional[str] = None

class ContextDropRequest(BaseModel):
    source: str
    content: str

# process_integration_sync has been moved to arq_worker.py to support the Arq queue

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
    
    from app.models.operations import SyncJob
    
    # Create the job synchronously so we don't lose it if we crash
    job = SyncJob(
        organization_id=uuid.UUID(org_id),
        provider="metaphor_onboarding",
        status="Initializing synchronization...",
        payload={
            "user_id": str(user.id),
            "sources": request.sources,
            "github_repo": request.github_repo
        }
    )
    session.add(job)
    await session.commit()
    await session.refresh(job)
    
    from arq import create_pool
    from arq.connections import RedisSettings
    from app.core.config import settings
    import urllib.parse
    
    parsed = urllib.parse.urlparse(settings.REDIS_URL)
    redis_host = parsed.hostname or "localhost"
    redis_port = parsed.port or 6379
    
    redis = await create_pool(RedisSettings(host=redis_host, port=redis_port))
    await redis.enqueue_job(
        "process_integration_sync",
        user_id=str(user.id),
        org_id=org_id,
        sources=request.sources,
        github_repo=request.github_repo,
        job_id=job.id
    )
    
    return {"status": "sync_started", "message": "Integration sync running in the background via Arq."}

@router.post("/drop")
async def context_drop(
    request: ContextDropRequest,
    db: AsyncSession = Depends(get_session)
):
    """
    Accepts raw text drops from ChatGPT, Claude, or any text source.
    """
    from app.services.identity import IdentityService
    identity = IdentityService(db)
    org = await identity.get_or_create_default_organization()
    
    from app.models.operations import WebhookEvent
    event = WebhookEvent(
        provider=request.source,
        event_type="context_drop",
        payload={"content": request.content},
        organization_id=org.id
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    
    from app.services.graph import GraphService
    from app.services.reflection import ReflectionService
    graph = GraphService(db)
    reflection = ReflectionService(graph)
    
    await reflection.process_event(event, org.id)
    
    return {"status": "success", "message": "Context drop processed."}

@router.get("/status")
async def check_integration_status(
    user: User = Depends(get_user_via_api_key),
    session: AsyncSession = Depends(get_session)
):
    """
    Checks if there are any nodes in the graph for the user's primary organization.
    This serves as a polling endpoint to know if the background sync has completed.
    Returns the latest progress message from the SyncJob table.
    """
    from sqlmodel import select, desc
    from app.models.identity import OrganizationMember
    from app.models.graph import Node
    from app.models.operations import SyncJob
    
    stmt = select(OrganizationMember).where(OrganizationMember.user_id == user.id)
    result = await session.execute(stmt)
    org_member = result.scalars().first()
    
    if not org_member:
        return {"status": "no_org", "has_data": False, "message": ""}
        
    stmt_nodes = select(Node).where(Node.organization_id == org_member.organization_id).limit(1)
    result_nodes = await session.execute(stmt_nodes)
    node = result_nodes.scalars().first()
    
    stmt_job = select(SyncJob).where(
        SyncJob.organization_id == org_member.organization_id, 
        SyncJob.provider == "metaphor_onboarding"
    ).order_by(desc(SyncJob.started_at)).limit(1)
    result_job = await session.execute(stmt_job)
    latest_job = result_job.scalars().first()
    
    job_msg = latest_job.status if latest_job else ("completed" if node else "Initializing synchronization...")
    if latest_job and latest_job.status == "failed":
        job_msg = "failed"
    
    return {
        "status": "completed" if (latest_job and latest_job.status == "completed") or (not latest_job and node) else job_msg,
        "message": job_msg,
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
        "user_id": str(user.id),
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
        
    elif provider == "linear":
        client_id = settings.LINEAR_CLIENT_ID
        redirect_uri = f"{base_url}{settings.API_PREFIX}/integrations/linear/callback"
        if not client_id:
            return {"url": f"{redirect_uri}?code=mock_code_linear&state={state_token}"}
        auth_url = f"https://linear.app/oauth/authorize?client_id={client_id}&redirect_uri={urllib.parse.quote(redirect_uri)}&response_type=code&state={state_token}&scope=read"
        return {"url": auth_url}
        
    elif provider == "google":
        client_id = settings.GOOGLE_CLIENT_ID
        redirect_uri = f"{base_url}{settings.API_PREFIX}/integrations/google/callback"
        if not client_id:
            return {"url": f"{redirect_uri}?code=mock_code_google&state={state_token}"}
        # We need access to Gmail (readonly) and Calendar (readonly)
        scopes = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly"
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?client_id={client_id}&redirect_uri={urllib.parse.quote(redirect_uri)}&response_type=code&state={state_token}&scope={urllib.parse.quote(scopes)}&access_type=offline&prompt=consent"
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
    from app.core.security import encrypt_token
    import base64
    
    try:
        payload = jwt.decode(state, settings.SECRET_KEY, algorithms=["HS256"])
        org_id = payload.get("org_id")
        user_id = payload.get("user_id")
        if not org_id or not user_id or payload.get("provider") != provider:
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
                    "redirect_uri": f"{settings.BACKEND_URL}{settings.API_PREFIX}/integrations/github/callback"
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
                    "redirect_uri": f"{settings.BACKEND_URL}{settings.API_PREFIX}/integrations/notion/callback"
                },
                headers={
                    "Authorization": f"Basic {b64_auth}",
                    "Content-Type": "application/json"
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                access_token = data.get("access_token")

        elif provider == "linear":
            resp = await client.post(
                "https://api.linear.app/oauth/token",
                data={
                    "client_id": settings.LINEAR_CLIENT_ID,
                    "client_secret": settings.LINEAR_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": f"{settings.BACKEND_URL}{settings.API_PREFIX}/integrations/linear/callback",
                    "grant_type": "authorization_code"
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                access_token = data.get("access_token")

        elif provider == "google":
            resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": f"{settings.BACKEND_URL}{settings.API_PREFIX}/integrations/google/callback",
                    "grant_type": "authorization_code"
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                access_token = data.get("access_token")
                refresh_token = data.get("refresh_token") # Could store this in the future

    if access_token:
        # Upsert integration
        stmt = select(Integration).where(
            Integration.organization_id == uuid.UUID(org_id),
            Integration.user_id == uuid.UUID(user_id),
            Integration.provider == provider
        )
        result = await session.execute(stmt)
        integration = result.scalars().first()
        
        encrypted_token = encrypt_token(access_token)
        
        if integration:
            integration.access_token = encrypted_token
        else:
            integration = Integration(
                organization_id=uuid.UUID(org_id),
                user_id=uuid.UUID(user_id),
                provider=provider,
                access_token=encrypted_token
            )
            session.add(integration)
            
        await session.commit()
        
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/onboarding?success={provider}")
