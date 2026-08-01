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

logger = logging.getLogger("metaphor.integrations.gmail")

class GmailIngestor:
    def __init__(self):
        self.creds = None
        if settings.GOOGLE_SERVICE_ACCOUNT_JSON_PATH:
            try:
                self.creds = service_account.Credentials.from_service_account_file(
                    settings.GOOGLE_SERVICE_ACCOUNT_JSON_PATH, 
                    scopes=['https://www.googleapis.com/auth/gmail.readonly']
                )
            except Exception as e:
                logger.error(f"Failed to load Google credentials: {e}")

    async def fetch_recent_emails(self, limit: int = 5) -> List[Dict[str, Any]]:
        if not self.creds:
            raise Exception("No Google Service Account JSON provided in .env. Cannot fetch real Gmail data.")
            
        try:
            service = build('gmail', 'v1', credentials=self.creds)
            # This requires domain-wide delegation or impersonation for a real service account.
            # We assume 'me' maps to the delegated user for V1 simplicity.
            results = service.users().messages().list(userId='me', maxResults=limit).execute()
            messages = results.get('messages', [])
            
            emails = []
            for msg in messages:
                txt = service.users().messages().get(userId='me', id=msg['id']).execute()
                headers = txt['payload']['headers']
                subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
                sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown Sender')
                emails.append({
                    "id": msg['id'],
                    "subject": subject,
                    "sender": sender,
                    "snippet": txt.get('snippet', ''),
                    "date": datetime.datetime.utcnow().isoformat()
                })
            return emails
        except Exception as e:
            logger.error(f"Gmail API Error: {e}")
            return []

    async def fetch_raw_events(self, limit: int = 5) -> List[Dict[str, Any]]:
        emails = await self.fetch_recent_emails(limit)
        events = []
        for email in emails:
            events.append({
                "id": email.get("id"),
                "subject": email.get("subject"),
                "sender": email.get("sender"),
                "snippet": email.get("snippet"),
                "date": email.get("date")
            })
        return events

gmail_ingestor = GmailIngestor()
