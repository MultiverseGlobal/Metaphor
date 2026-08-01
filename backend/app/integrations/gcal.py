import datetime
import logging
import uuid
from typing import List, Dict, Any
from google.oauth2 import service_account
from googleapiclient.discovery import build
from app.core.config import settings
from app.models.operations import WebhookEvent
from sqlmodel.ext.asyncio.session import AsyncSession
from app.services.reflection import ReflectionService
from app.services.graph import GraphService

logger = logging.getLogger("metaphor.integrations.gcal")

class GCalIngestor:
    def __init__(self):
        self.creds = None
        if settings.GOOGLE_SERVICE_ACCOUNT_JSON_PATH:
            try:
                self.creds = service_account.Credentials.from_service_account_file(
                    settings.GOOGLE_SERVICE_ACCOUNT_JSON_PATH, 
                    scopes=['https://www.googleapis.com/auth/calendar.readonly']
                )
            except Exception as e:
                logger.error(f"Failed to load Google credentials: {e}")

    async def fetch_upcoming_events(self, limit: int = 5) -> List[Dict[str, Any]]:
        if not self.creds:
            raise Exception("No Google Service Account JSON provided in .env. Cannot fetch real Calendar data.")
            
        try:
            service = build('calendar', 'v3', credentials=self.creds)
            now = datetime.datetime.utcnow().isoformat() + 'Z'
            events_result = service.events().list(
                calendarId='primary', timeMin=now,
                maxResults=limit, singleEvents=True,
                orderBy='startTime').execute()
            events = events_result.get('items', [])
            
            parsed_events = []
            for event in events:
                start = event['start'].get('dateTime', event['start'].get('date'))
                parsed_events.append({
                    "id": event['id'],
                    "title": event.get('summary', 'Untitled Event'),
                    "description": event.get('description', ''),
                    "date": start
                })
            return parsed_events
        except Exception as e:
            logger.error(f"GCal API Error: {e}")
            return []

    async def fetch_raw_events(self, limit: int = 5) -> List[Dict[str, Any]]:
        calendar_events = await self.fetch_upcoming_events(limit)
        events = []
        for cevent in calendar_events:
            events.append({
                "id": cevent.get("id"),
                "title": cevent.get("title"),
                "description": cevent.get("description"),
                "date": cevent.get("date")
            })
        return events

gcal_ingestor = GCalIngestor()
