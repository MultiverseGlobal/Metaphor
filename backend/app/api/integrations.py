import asyncio
import logging
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

async def process_integration_sync(
    user_id: str,
    org_id: str,
    sources: List[str],
    github_repo: str
):
    """
    Background task that fetches data from the requested sources and feeds it into the Knowledge Graph.
    """
    try:
        combined_content = f"User {user_id} has connected the following sources: {', '.join(sources)}.\n\n"
        
        if "github" in sources:
            logger.info(f"Fetching GitHub repo: {github_repo}")
            github_content = await fetch_public_repository(github_repo)
            combined_content += github_content + "\n\n"
            
        if "notion" in sources:
            logger.info("Fetching Notion mockup")
            notion_content = await fetch_notion_mockup()
            combined_content += notion_content + "\n\n"
            
        # Initialize an isolated DB session for the background task
        from app.database.session import get_session_context
        async for session in get_session_context():
            reflection_service = ReflectionService(session)
            # Create a synthetic context session for this background sync
            from app.models.graph import ContextSession
            import uuid
            session_id = uuid.uuid4()
            ctx = ContextSession(
                id=session_id,
                organization_id=uuid.UUID(org_id),
                user_id=uuid.UUID(user_id),
                title="Integration Sync",
            )
            session.add(ctx)
            await session.commit()
            
            # Feed into graph
            await reflection_service.reflect_and_evolve(
                org_id=org_id,
                session_id=str(session_id),
                content=combined_content
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
        github_repo=request.github_repo
    )
    
    return {"status": "sync_started", "message": "Integration sync running in the background."}
