import logging
import os
from typing import List, Dict, Any
from google.oauth2 import service_account
from googleapiclient.discovery import build
from app.config import settings

logger = logging.getLogger("metaphor.parsers.google")

class GoogleParser:
    def __init__(self):
        self.creds = None
        json_path = settings.GOOGLE_SERVICE_ACCOUNT_JSON_PATH
        if json_path and os.path.exists(json_path):
            try:
                self.creds = service_account.Credentials.from_service_account_file(
                    json_path,
                    scopes=[
                        "https://www.googleapis.com/auth/drive.readonly",
                        "https://www.googleapis.com/auth/calendar.readonly"
                    ]
                )
            except Exception as e:
                logger.error(f"Error loading Google service account file: {e}")

    async def fetch_documents(self) -> List[Dict[str, Any]]:
        """
        Fetch files from Google Drive and events from Google Calendar.
        If service account is not configured, returns mock records.
        """
        if not self.creds:
            logger.info("Using mock Google Drive & Calendar data (credentials not configured).")
            return self._get_mock_documents()

        documents = []
        try:
            # Load Drive documents
            drive_service = build("drive", "v3", credentials=self.creds)
            # Query for text documents/gdocs
            drive_results = drive_service.files().list(
                q="mimeType='application/vnd.google-apps.document' or mimeType='text/plain'",
                pageSize=5,
                fields="files(id, name, webViewLink, createdTime, modifiedTime)"
            ).execute()
            
            files = drive_results.get("files", [])
            for file in files:
                file_id = file.get("id")
                # Export Google doc as text
                try:
                    content_resp = drive_service.files().export(
                        fileId=file_id,
                        mimeType="text/plain"
                    ).execute()
                    content = content_resp.decode("utf-8")
                except Exception:
                    # Fallback for plain text files
                    try:
                        content_resp = drive_service.files().get_media(fileId=file_id).execute()
                        content = content_resp.decode("utf-8")
                    except Exception as fe:
                        logger.warning(f"Could not read content for file {file.get('name')}: {fe}")
                        content = ""

                documents.append({
                    "id": f"google_drive_{file_id}",
                    "title": f"Google Doc: {file.get('name')}",
                    "content": content,
                    "source": "google_drive",
                    "metadata": {
                        "url": file.get("webViewLink"),
                        "created_time": file.get("createdTime"),
                        "last_edited_time": file.get("modifiedTime"),
                        "type": "document"
                    }
                })

            # Load Calendar events
            calendar_service = build("calendar", "v3", credentials=self.creds)
            # Fetch events from primary calendar
            calendar_results = calendar_service.events().list(
                calendarId="primary",
                maxResults=10,
                singleEvents=True,
                orderBy="startTime"
            ).execute()
            
            events = calendar_results.get("items", [])
            for event in events:
                start = event.get("start", {}).get("dateTime") or event.get("start", {}).get("date")
                summary = event.get("summary", "Untitled Meeting")
                description = event.get("description", "")
                documents.append({
                    "id": f"google_calendar_{event.get('id')}",
                    "title": f"Calendar Event: {summary}",
                    "content": f"Event: {summary}\nStart: {start}\nDescription: {description}",
                    "source": "google_calendar",
                    "metadata": {
                        "start_time": start,
                        "url": event.get("htmlLink"),
                        "type": "calendar"
                    }
                })

            return documents
        except Exception as e:
            logger.error(f"Error fetching Google services: {e}")
            return self._get_mock_documents()

    def _get_mock_documents(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "google_drive_mock_1",
                "title": "Google Doc: Atlas Client Interview Notes",
                "content": """Atlas Client Interview: TechFounder Inc (CEO Sarah)
Date: 2026-07-15

Discussion details:
Sarah runs a 5-person dev team building a real-estate platform.
- Pain: Deployments break constantly. Their junior devs take hours tracking cloud setup issues.
- pricing: "I would easily pay $500 to $1000/month if Atlas can automatically manage our dev environments and verify that costs stay under control."
- feature request: They want a unified timeline where they can see what commit caused what deployment, and whether the build broke any budgeting rules.

Benjamin's takeaway:
A visual timeline linking code commits, deployments, and business rules is a massive differentiator. We need to implement a Temporal dimension in our context modeling.""",
                "source": "google_drive",
                "metadata": {
                    "url": "https://docs.google.com/document/d/mock1",
                    "created_time": "2026-07-15T15:00:00Z",
                    "last_edited_time": "2026-07-15T16:00:00Z",
                    "type": "document"
                }
            },
            {
                "id": "google_calendar_mock_1",
                "title": "Calendar Event: Atlas Pricing Review Sync",
                "content": """Event: Atlas Pricing Review Sync
Start: 2026-07-15T14:00:00Z
End: 2026-07-15T15:00:00Z
Description: Benjamin and Sarah (TechFounder Inc) call to align on pricing models.
Discussed value-based tiers. Focus on validation rules and DevOps time-savings.""",
                "source": "google_calendar",
                "metadata": {
                    "start_time": "2026-07-15T14:00:00Z",
                    "url": "https://calendar.google.com/event?id=mock1",
                    "type": "calendar"
                }
            },
            {
                "id": "google_calendar_mock_2",
                "title": "Calendar Event: Metaphor Brainstorming session",
                "content": """Event: Metaphor Brainstorming session
Start: 2026-07-16T09:00:00Z
End: 2026-07-16T10:00:00Z
Description: Reviewing context engines. Discussing shifting memory from raw documents to object-oriented graphs representing People, Ideas, Decisions, and Commit timelines.""",
                "source": "google_calendar",
                "metadata": {
                    "start_time": "2026-07-16T09:00:00Z",
                    "url": "https://calendar.google.com/event?id=mock2",
                    "type": "calendar"
                }
            }
        ]
