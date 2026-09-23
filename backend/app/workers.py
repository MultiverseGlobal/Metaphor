import logging
import asyncio
from app.database.session import get_session_context
from sqlmodel import select
from app.models.operations import SyncJob
from arq import create_pool
from app.core.config import settings
from app.core.redis_utils import parse_redis_settings

logger = logging.getLogger(__name__)

async def resume_stuck_jobs():
    """
    Finds processing SyncJobs that got stuck (e.g., pod restart without Redis persistence) and resumes them.
    Called from main.py startup lifespan.
    """
    try:
        redis_settings = parse_redis_settings(settings.REDIS_URL)
        redis = await create_pool(redis_settings)

        async with get_session_context() as session:
            stmt = select(SyncJob).where(SyncJob.status != "completed", SyncJob.status != "failed")
            result = await session.execute(stmt)
            stuck_jobs = result.scalars().all()
            
            for job in stuck_jobs:
                logger.info(f"Resuming stuck job {job.id} for org {job.organization_id} via Arq")
                payload = job.payload or {}
                if not payload:
                    job.status = "failed"
                    job.error_message = "No payload to resume"
                    session.add(job)
                    continue
                    
                await redis.enqueue_job(
                    "process_integration_sync",
                    user_id=payload.get("user_id"),
                    org_id=str(job.organization_id),
                    sources=payload.get("sources", []),
                    github_repo=payload.get("github_repo", "tiangolo/fastapi"),
                    job_id=job.id
                )
            await session.commit()
    except Exception as e:
        logger.error(f"Error resuming stuck jobs: {e}")
