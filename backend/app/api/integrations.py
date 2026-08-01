from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from app.database.session import get_session, async_session_maker
from app.core.security import get_current_user
from app.models.identity import User
from app.services.identity import IdentityService
import uuid

router = APIRouter()

async def bg_sync(provider: str, org_id: uuid.UUID, limit: int = 5):
    """Background task wrapper to handle independent database sessions for integrations."""
    async with async_session_maker() as session:
        if provider == "notion":
            from app.integrations.notion import notion_ingestor
            await notion_ingestor.process_and_ingest(session, org_id, limit)
        elif provider == "gmail":
            from app.integrations.gmail import gmail_ingestor
            await gmail_ingestor.process_and_ingest(session, org_id, limit)
        elif provider == "gcal":
            from app.integrations.gcal import gcal_ingestor
            await gcal_ingestor.process_and_ingest(session, org_id, limit)

@router.post("/{provider}/sync")
async def sync_integration(
    provider: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    valid_providers = ["notion", "gmail", "gcal"]
    if provider not in valid_providers:
        raise HTTPException(status_code=400, detail=f"Unknown provider: {provider}")

    identity = IdentityService(db)
    org = await identity.get_user_organization(current_user.id) or await identity.get_or_create_default_organization()
    
    # Run the sync synchronously through the Sync Engine
    from app.services.sync import SyncEngine
    try:
        sync_engine = SyncEngine(db)
        await sync_engine.run_pull_sync(provider, org.id, 5)
        return {"status": "success", "provider": provider}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
