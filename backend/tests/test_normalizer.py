import pytest
from app.ingestion.normalizer import EventNormalizer

@pytest.mark.asyncio
async def test_github_commit_normalization():
    normalizer = EventNormalizer()
    raw_doc = {
        "id": "github_commit_123",
        "title": "GitHub Commit: feat: add pgvector table",
        "content": "Commit by Benjamin on 2026-07-21T18:00:00Z\n\nSHA: 123456\nMessage: feat: add pgvector table",
        "source": "github",
        "metadata": {
            "repo": "pseudonyms/metaphor",
            "sha": "123456",
            "author": "Benjamin",
            "date": "2026-07-21T18:00:00Z",
            "type": "commit"
        }
    }

    event = normalizer.normalize(raw_doc)
    assert event.source == "github"
    assert event.entity == "commit"
    assert event.action == "pushed"
    assert event.normalized_payload["actor"] == "Benjamin"
    assert event.normalized_payload["target"] == "pseudonyms/metaphor"

@pytest.mark.asyncio
async def test_notion_page_normalization():
    normalizer = EventNormalizer()
    raw_doc = {
        "id": "notion_page_456",
        "title": "Metaphor OS Architecture",
        "content": "Full architecture spec detailing Metaphor Context OS layer.",
        "source": "notion",
        "metadata": {
            "author": "Benjamin",
            "url": "https://notion.so/metaphor-arch",
            "last_edited_time": "2026-07-21T19:00:00Z",
            "type": "page"
        }
    }

    event = normalizer.normalize(raw_doc)
    assert event.source == "notion"
    assert event.entity == "page"
    assert event.action == "updated"
    assert event.normalized_payload["title"] == "Metaphor OS Architecture"

@pytest.mark.asyncio
async def test_google_calendar_normalization():
    normalizer = EventNormalizer()
    raw_doc = {
        "id": "gcal_event_789",
        "title": "Atlas & Metaphor Alignment Sync",
        "content": "Sync meeting to establish product boundaries.",
        "source": "google_calendar",
        "metadata": {
            "organizer": "Benjamin",
            "start": "2026-07-21T20:00:00Z",
            "attendees": ["david@xyz.com"],
            "type": "event"
        }
    }

    event = normalizer.normalize(raw_doc)
    assert event.source == "google_calendar"
    assert event.entity == "meeting"
    assert event.action == "scheduled"
    assert "david@xyz.com" in event.normalized_payload["attendees"]
