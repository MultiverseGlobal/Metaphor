import httpx
import logging
from typing import List, Dict, Any
from app.core.config import settings
from app.models.operations import WebhookEvent
from sqlmodel.ext.asyncio.session import AsyncSession
from app.services.reflection import ReflectionService
from app.services.graph import GraphService
import datetime
import uuid

logger = logging.getLogger("metaphor.integrations.notion")
NOTION_API_VERSION = "2022-06-28"

class NotionIngestor:
    def __init__(self, token: str = None):
        self.token = token or settings.NOTION_INTEGRATION_TOKEN
            
    @property
    def headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.token}",
            "Notion-Version": NOTION_API_VERSION,
            "Content-Type": "application/json"
        }

    async def fetch_recent_pages(self, limit: int = 5) -> List[Dict[str, Any]]:
        if not self.token:
            return []
        url = "https://api.notion.com/v1/search"
        payload = {"query": "", "sort": {"direction": "descending", "timestamp": "last_edited_time"}, "page_size": limit}
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers=self.headers, timeout=30.0)
            if resp.status_code != 200: return []
            return [res for res in resp.json().get("results", []) if res.get("object") == "page"]

    async def fetch_page_blocks(self, page_id: str) -> List[Dict[str, Any]]:
        url = f"https://api.notion.com/v1/blocks/{page_id}/children"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=self.headers, timeout=30.0)
            if resp.status_code != 200: return []
            return resp.json().get("results", [])

    def extract_text(self, blocks: List[Dict[str, Any]]) -> str:
        text = ""
        for block in blocks:
            btype = block.get("type")
            if not btype or btype not in block: continue
            for rt in block[btype].get("rich_text", []):
                text += rt.get("plain_text", "")
            text += "\n"
        return text.strip()

    async def process_and_ingest(self, db_session: AsyncSession, org_id: uuid.UUID, limit: int = 5):
        if not self.token: return
        pages = await self.fetch_recent_pages(limit=limit)
        graph_service = GraphService(db_session)
        reflection_service = ReflectionService(graph_service)
        
        for page in pages:
            page_id = page.get("id")
            title_arr = page.get("properties", {}).get("title", {}).get("title", [])
            title = title_arr[0].get("plain_text", "Untitled") if title_arr else "Untitled"
            
            blocks = await self.fetch_page_blocks(page_id)
            content = self.extract_text(blocks)
            if not content: continue
            
            # Create WebhookEvent (V2 schema)
            event = WebhookEvent(
                provider="notion",
                event_type="page_updated",
                payload={"id": page_id, "title": title, "content": content, "url": page.get("url")}
            )
            db_session.add(event)
            await db_session.commit()
            
            # Trigger Reflection
            logger.info(f"Reflecting on Notion page: {title}")
            await reflection_service.reflect_and_evolve(org_id, event)
            
            event.processed_at = datetime.datetime.utcnow()
            db_session.add(event)
            await db_session.commit()

notion_ingestor = NotionIngestor()
