import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func

from app.database.session import get_session
from app.core.security import get_user_via_api_key
from app.models.identity import User
from app.models.operations import Integration, SyncJob, WebhookEvent
from app.services.identity import IdentityService
from app.services.sync import SyncEngine

router = APIRouter()

@router.get("")
async def get_integrations(
    current_user: User = Depends(get_user_via_api_key),
    db: AsyncSession = Depends(get_session)
) -> Any:
    """Returns real status of all connected integrations for the user's organization."""
    identity = IdentityService(db)
    org = await identity.get_user_organization(current_user.id) or await identity.get_or_create_default_organization()
    
    # Query event counts per provider from WebhookEvent
    providers = ["notion", "gmail", "gcal", "github", "linear"]
    res = []
    
    for p in providers:
        stmt = select(func.count(WebhookEvent.id)).where(WebhookEvent.provider == p)
        event_count_res = await db.execute(stmt)
        event_count = event_count_res.scalar() or 0
        
        # Check last sync job
        job_stmt = select(SyncJob).where(
            SyncJob.organization_id == org.id,
            SyncJob.provider == p
        ).order_by(SyncJob.started_at.desc())
        job_res = await db.execute(job_stmt)
        last_job = job_res.scalars().first()
        
        status = "connected" if event_count > 0 or (last_job and last_job.status == "completed") else "disconnected"
        
        res.append({
            "provider": p,
            "status": status,
            "events_processed": event_count,
            "last_sync": last_job.completed_at.isoformat() if last_job and last_job.completed_at else None
        })
        
    return res

@router.post("/{provider}/sync")
async def sync_integration(
    provider: str,
    current_user: User = Depends(get_user_via_api_key),
    db: AsyncSession = Depends(get_session)
):
    valid_providers = ["notion", "gmail", "gcal", "github", "linear"]
    if provider not in valid_providers:
        raise HTTPException(status_code=400, detail=f"Unknown provider: {provider}")

    identity = IdentityService(db)
    org = await identity.get_user_organization(current_user.id) or await identity.get_or_create_default_organization()
    
    try:
        sync_engine = SyncEngine(db)
        await sync_engine.run_pull_sync(provider, org.id, 5)
        return {"status": "success", "provider": provider}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
