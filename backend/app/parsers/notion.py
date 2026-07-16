import logging
from typing import List, Dict, Any
import httpx
from app.config import settings

logger = logging.getLogger("metaphor.parsers.notion")

class NotionParser:
    def __init__(self):
        self.headers = {
            "Authorization": f"Bearer {settings.NOTION_INTEGRATION_TOKEN}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        }

    async def fetch_documents(self) -> List[Dict[str, Any]]:
        """
        Fetch pages/databases from Notion. If the NOTION_INTEGRATION_TOKEN is not configured,
        returns mock documents representing the Atlas and William projects.
        """
        if not settings.NOTION_INTEGRATION_TOKEN:
            logger.info("Using mock Notion data (token not configured).")
            return self._get_mock_documents()

        try:
            async with httpx.AsyncClient() as client:
                # Query all pages accessible to this integration token
                response = await client.post(
                    "https://api.notion.com/v1/search",
                    headers=self.headers,
                    json={"filter": {"value": "page", "property": "object"}}
                )
                response.raise_for_status()
                search_results = response.json().get("results", [])

                documents = []
                for page in search_results:
                    page_id = page.get("id")
                    title = "Untitled"
                    
                    # Extract page title
                    properties = page.get("properties", {})
                    for prop_name, prop_val in properties.items():
                        if prop_val.get("type") == "title":
                            title_list = prop_val.get("title", [])
                            if title_list:
                                title = "".join([t.get("plain_text", "") for t in title_list])
                                break

                    # Fetch page content blocks
                    content = await self._fetch_page_content(page_id)
                    documents.append({
                        "id": f"notion_{page_id}",
                        "title": title,
                        "content": content,
                        "source": "notion",
                        "metadata": {
                            "url": page.get("url"),
                            "created_time": page.get("created_time"),
                            "last_edited_time": page.get("last_edited_time")
                        }
                    })
                return documents
        except Exception as e:
            logger.error(f"Error fetching Notion documents: {e}")
            # Fallback to mock data on error so development doesn't break
            return self._get_mock_documents()

    async def _fetch_page_content(self, page_id: str) -> str:
        """Helper to fetch block children and format as Markdown-like text."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://api.notion.com/v1/blocks/{page_id}/children",
                    headers=self.headers
                )
                response.raise_for_status()
                blocks = response.json().get("results", [])
                
                text_blocks = []
                for block in blocks:
                    block_type = block.get("type")
                    if block_type in ["paragraph", "heading_1", "heading_2", "heading_3", "bulleted_list_item", "numbered_list_item"]:
                        content_list = block.get(block_type, {}).get("rich_text", [])
                        text = "".join([t.get("plain_text", "") for t in content_list])
                        if text:
                            if block_type == "heading_1":
                                text_blocks.append(f"# {text}")
                            elif block_type == "heading_2":
                                text_blocks.append(f"## {text}")
                            elif block_type == "heading_3":
                                text_blocks.append(f"### {text}")
                            else:
                                text_blocks.append(text)
                return "\n\n".join(text_blocks)
        except Exception as e:
            logger.error(f"Error fetching blocks for Notion page {page_id}: {e}")
            return ""

    def _get_mock_documents(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "notion_mock_page_1",
                "title": "Atlas: Ideal Customer Profile (ICP)",
                "content": """# Atlas Ideal Customer Profile (ICP)
                
## Targeted Audience
- Early-stage technical founders building B2B SaaS applications.
- Small teams (2-10 developers) who need to streamline their deployment and environment management.
- Specifically focusing on builders who have high developer velocity but struggle with cloud infrastructure costs and devops bottlenecks.

## Key Pain Points
1. Wasting time building standard CI/CD pipelines instead of product features.
2. High cloud bills from AWS/GCP developer instances running 24/7.
3. Lack of unified dashboard to visualize environment configurations.

## Proposed Solution Value
Atlas simplifies their infrastructure, offering immediate cost alerts and simple containerized deployment templates, saving them up to 10 hours a week.""",
                "source": "notion",
                "metadata": {
                    "url": "https://notion.so/atlas-icp",
                    "created_time": "2026-07-10T10:00:00Z",
                    "last_edited_time": "2026-07-15T15:30:00Z"
                }
            },
            {
                "id": "notion_mock_page_2",
                "title": "Atlas: Core Pricing Strategy",
                "content": """# Atlas Pricing & Business Plan
                
## Current Hypothesis
We need a pricing model that reflects developer usage without introducing billing anxiety.

## Proposed Tiers
1. **Developer Sandbox (Free)**: Up to 2 active environments, basic metrics.
2. **Founder Operating Sprint ($500/month)**: Unlimited environments, custom domain integration, priority support, and daily cost analysis reports.
3. **Scale (Usage-based)**: Customized billing for teams needing massive container orchestrations.

## Discussion Points
- Benjamin feels $500/month is perfect for founders who want peace of mind, but we must justify it by highlighting devops time saved.
- Need to check if our API rate limits would support this tier structure.""",
                "source": "notion",
                "metadata": {
                    "url": "https://notion.so/atlas-pricing",
                    "created_time": "2026-07-12T09:00:00Z",
                    "last_edited_time": "2026-07-16T02:00:00Z"
                }
            },
            {
                "id": "notion_mock_page_3",
                "title": "William: Core Execution System",
                "content": """# Project William - Product Strategy

William acts as the execution agent (what should I do next?). It answers specific task-level execution requests and coordinates developers.

## Design Details
William will connect to GitHub issues, Notion tickets, and Slack messages to queue work.
- It parses developer goals.
- It recommends next steps.
- Integrates with the Atlas API to fetch business constraints (e.g. 'do not deploy database updates that exceed $100 budget limit').

## Sync Strategy
Need to make sure William doesn't execute tasks that conflict with Atlas's core pricing or client delivery timelines. William requires deep system context.""",
                "source": "notion",
                "metadata": {
                    "url": "https://notion.so/william-product",
                    "created_time": "2026-07-14T11:00:00Z",
                    "last_edited_time": "2026-07-15T18:45:00Z"
                }
            }
        ]
