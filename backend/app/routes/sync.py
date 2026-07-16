import logging
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.database import get_session
from app.config import settings
from app.parsers.notion import NotionParser
from app.parsers.github import GitHubParser
from app.parsers.google_services import GoogleParser
from app.reflection import reflection_engine

logger = logging.getLogger("metaphor.routes.sync")
router = APIRouter()

async def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != settings.METAPHOR_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid API Key")
    return x_api_key

@router.post("/sync", response_model=Dict[str, Any])
async def trigger_workspace_sync(
    session: AsyncSession = Depends(get_session),
    api_key: str = Depends(verify_api_key)
):
    """
    Trigger manual or periodic sync:
    1. Fetch documents from Notion, GitHub, and Google Calendar/Drive.
    2. Feed all raw docs to the Reflection Engine to update Objects and Relationships.
    """
    logger.info("Starting Metaphor workspace sync...")
    try:
        notion_parser = NotionParser()
        github_parser = GitHubParser()
        google_parser = GoogleParser()

        # Gather logs from all three channels
        notion_logs = await notion_parser.fetch_documents()
        github_logs = await github_parser.fetch_documents()
        google_logs = await google_parser.fetch_documents()

        all_logs = notion_logs + github_logs + google_logs
        
        logger.info(f"Gathered {len(all_logs)} logs. Ingesting to Reflection Engine...")
        report = await reflection_engine.reflect_and_evolve(session, all_logs)

        # Seed some mock pending memories and clarifications to demonstrate the new Context Inbox
        from app.models import Clarification, Node, Edge
        from sqlmodel import select
        
        # Check if we already have clarifications
        existing_clar_q = await session.exec(select(Clarification))
        if not existing_clar_q.first():
            clar1 = Clarification(
                question_text="I detected that Atlas and William may be related. Are they:",
                options_json=["Separate companies", "Products in one ecosystem", "Something else"],
                resolved=False
            )
            clar2 = Clarification(
                question_text="I detected multiple references to Benjamin's focus change. Is Weave a desktop app or a service?",
                options_json=["Desktop application", "Context service layer", "Chrome extension", "Unsure"],
                resolved=False
            )
            session.add(clar1)
            session.add(clar2)

        # Create some pending nodes/edges if none exist
        existing_pending_q = await session.exec(select(Node).where(Node.status == "pending"))
        if not existing_pending_q.first():
            # Find or create Atlas node for structural reference
            atlas_node_q = await session.exec(select(Node).where(Node.name == "Atlas"))
            atlas_node = atlas_node_q.first()
            if not atlas_node:
                atlas_node = Node(
                    name="Atlas",
                    type="Project",
                    metadata_json={"description": "Context visualization portal"},
                    status="approved"
                )
                session.add(atlas_node)
                await session.flush()
            
            # Create a pending decision node
            pricing_decision = Node(
                name="Increase Atlas pricing to $500",
                type="Decision",
                metadata_json={
                    "type": "Pricing Change",
                    "previous_value": "$300",
                    "new_value": "$500",
                    "reason": "Reflecting premium enterprise context capabilities",
                    "confidence": 0.85
                },
                status="pending"
            )
            session.add(pricing_decision)
            await session.flush()

            # Link the pending decision to Atlas project
            pending_edge = Edge(
                source_id=pricing_decision.id,
                target_id=atlas_node.id,
                dimension="structural",
                relationship_type="belongs_to",
                metadata_json={"description": "Proposed structural attachment: Decision belongs to Atlas."},
                status="pending"
            )
            session.add(pending_edge)

        await session.commit()
        
        return {
            "status": "success",
            "message": f"Sync finished successfully. Ingested {len(all_logs)} log events.",
            "report": report
        }
    except Exception as e:
        logger.error(f"Error during manual sync: {e}")
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")
