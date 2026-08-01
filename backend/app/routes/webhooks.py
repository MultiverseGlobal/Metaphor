import logging
from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Dict, Any

from app.database.session import get_session
from app.ingestion.normalizer import normalizer
from app.reflection import reflection_engine

logger = logging.getLogger("metaphor.routes.webhooks")
router = APIRouter()

# ──────────────────────────────────────────────────────────────────────────────
# Webhook Validation (Mocked for V1 Prototyping)
# ──────────────────────────────────────────────────────────────────────────────
async def verify_github_signature(request: Request):
    """
    In V2, this will use hmac to verify X-Hub-Signature-256 against a secret.
    For V1 prototyping, we mock the validation to allow easy local testing.
    """
    logger.debug("Mock verifying GitHub webhook signature...")
    return True

async def verify_notion_signature(request: Request):
    """Mock validation for Notion"""
    return True

async def verify_google_signature(request: Request):
    """Mock validation for Google Push Notifications"""
    return True


# ──────────────────────────────────────────────────────────────────────────────
# GitHub Passive Ingestion
# ──────────────────────────────────────────────────────────────────────────────
@router.post("/github", response_model=Dict[str, Any])
async def github_webhook(
    request: Request,
    session: AsyncSession = Depends(get_session),
    _valid: bool = Depends(verify_github_signature)
):
    try:
        payload = await request.json()
        event_type = request.headers.get("X-GitHub-Event", "unknown")
        
        logger.info(f"Received GitHub webhook event: {event_type}")
        
        # Wrap raw payload in a structure the Normalizer understands for GitHub
        raw_doc = {
            "id": str(uuid.uuid4()),
            "source": "github",
            "metadata": {
                "type": "commit" if event_type == "push" else "issue" if "issue" in event_type else "generic",
                "event": event_type,
                "repo": payload.get("repository", {}).get("full_name", "unknown"),
                "author": payload.get("sender", {}).get("login", "Unknown"),
            },
            "title": f"GitHub Event: {event_type}",
            "content": str(payload)  # In production, we extract commits/body specifically
        }
        
        # Pass to Reflection Engine to build the World Model
        report = await reflection_engine.reflect_and_evolve(session, [raw_doc])
        await session.commit()
        
        return {"status": "success", "event": event_type, "report": report}

    except Exception as e:
        logger.error(f"Failed to process GitHub webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────────────────────────────────────
# Notion Passive Ingestion
# ──────────────────────────────────────────────────────────────────────────────
@router.post("/notion", response_model=Dict[str, Any])
async def notion_webhook(
    request: Request,
    session: AsyncSession = Depends(get_session),
    _valid: bool = Depends(verify_notion_signature)
):
    try:
        payload = await request.json()
        
        logger.info("Received Notion webhook event")
        
        raw_doc = {
            "id": str(uuid.uuid4()),
            "source": "notion",
            "metadata": {
                "type": "page",
                "author": "Notion Integration",
                "url": payload.get("url", "unknown-url")
            },
            "title": payload.get("title", "Updated Notion Document"),
            "content": str(payload)
        }
        
        report = await reflection_engine.reflect_and_evolve(session, [raw_doc])
        await session.commit()
        
        return {"status": "success", "source": "notion", "report": report}

    except Exception as e:
        logger.error(f"Failed to process Notion webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────────────────────────────────────
# Google Services (Drive/Calendar) Passive Ingestion
# ──────────────────────────────────────────────────────────────────────────────
@router.post("/google", response_model=Dict[str, Any])
async def google_webhook(
    request: Request,
    session: AsyncSession = Depends(get_session),
    _valid: bool = Depends(verify_google_signature)
):
    try:
        payload = await request.json()
        
        channel_id = request.headers.get("X-Goog-Channel-ID", "unknown")
        resource_state = request.headers.get("X-Goog-Resource-State", "unknown")
        
        logger.info(f"Received Google webhook for channel {channel_id}, state: {resource_state}")
        
        raw_doc = {
            "id": str(uuid.uuid4()),
            "source": "google_calendar",
            "metadata": {
                "type": "event",
                "state": resource_state
            },
            "title": "Google Service Update",
            "content": str(payload)
        }
        
        report = await reflection_engine.reflect_and_evolve(session, [raw_doc])
        await session.commit()
        
        return {"status": "success", "source": "google", "report": report}

    except Exception as e:
        logger.error(f"Failed to process Google webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))
