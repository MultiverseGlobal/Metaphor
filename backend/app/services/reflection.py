import json
import logging
from typing import List, Dict, Any
from app.services.llm import llm_service
from app.services.graph import GraphService
from app.models.operations import WebhookEvent
import uuid

logger = logging.getLogger("metaphor.services.reflection")

class ReflectionService:
    def __init__(self, graph_service: GraphService):
        self.graph = graph_service

    async def reflect_and_evolve(self, org_id: uuid.UUID, event: WebhookEvent) -> Dict[str, Any]:
        """
        Run the Reflection Agent to translate a WebhookEvent into Graph updates.
        """
        # Fetch existing nodes for context mapping
        existing_nodes = await self.graph.list_recent_nodes(org_id, limit=50)
        existing_nodes_context = [{"id": str(n.id), "title": n.title, "type": n.type} for n in existing_nodes]

        # Prepare payload
        payload_str = json.dumps(event.payload)

        # Build prompt
        system_prompt = (
            "You are the Metaphor Reflection Engine.\n"
            "Identify the underlying Objects (Nodes) and Relationships (Edges) from this new incoming data event.\n"
            "Objects can be: Person, Idea, Decision, Project, Document, Note, Goal, Event, Task.\n"
        )

        prompt = (
            f"Existing nodes in the graph:\n"
            f"{json.dumps(existing_nodes_context, indent=2)}\n\n"
            f"Incoming event payload:\n"
            f"{payload_str}\n\n"
            f"Task: Extract new Objects, Relationships (Edges), and link the event payload as Evidence.\n"
            f"Respond STRICTLY in JSON format with this schema:\n"
            f"{{\n"
            f"  \"nodes_to_create\": [\n"
            f"    {{\"title\": \"Object Name\", \"type\": \"Person|Idea|Decision|Project|Document\", \"summary\": \"Short description\", \"metadata\": {{}}}}\n"
            f"  ],\n"
            f"  \"edges_to_create\": [\n"
            f"    {{\"source_title\": \"Name\", \"target_title\": \"Name\", \"relationship_type\": \"owns|mentions|depends_on\"}}\n"
            f"  ],\n"
            f"  \"evidence_links\": [\n"
            f"    \"Object Name\"\n"
            f"  ]\n"
            f"}}\n"
        )

        # Call Gemini
        logger.info("Calling Gemini for reflection extraction...")
        response_text = await llm_service.query_llm(prompt=prompt, system_prompt=system_prompt, temperature=0.0)

        try:
            clean_response = response_text.strip()
            if clean_response.startswith("```json"):
                clean_response = clean_response[7:]
            if clean_response.endswith("```"):
                clean_response = clean_response[:-3]
            result = json.loads(clean_response)
        except Exception as e:
            logger.error(f"Failed to parse LLM JSON: {e}")
            return {"status": "error", "message": str(e)}

        # Apply to Graph
        created_nodes = {}
        for n_data in result.get("nodes_to_create", []):
            title = n_data.get("title")
            if not title: continue
            
            # Check if it already exists in the graph by title (naive check for now)
            existing = next((n for n in existing_nodes if n.title.lower() == title.lower()), None)
            if not existing:
                node = await self.graph.create_node(
                    org_id=org_id,
                    type=n_data.get("type", "Idea"),
                    title=title,
                    summary=n_data.get("summary", ""),
                    content=n_data.get("summary", ""), # Same as summary for now
                    metadata=n_data.get("metadata", {})
                )
                created_nodes[title.lower()] = node
            else:
                created_nodes[title.lower()] = existing

        # Add Evidence Links
        for title in result.get("evidence_links", []):
            node = created_nodes.get(title.lower()) or next((n for n in existing_nodes if n.title.lower() == title.lower()), None)
            if node:
                await self.graph.add_evidence(
                    node_id=node.id,
                    source=event.provider,
                    source_type=event.event_type,
                    raw_text=payload_str,
                    url=event.payload.get("url")
                )

        # Create Edges
        for edge_data in result.get("edges_to_create", []):
            src_node = created_nodes.get(edge_data.get("source_title", "").lower()) or next((n for n in existing_nodes if n.title.lower() == edge_data.get("source_title", "").lower()), None)
            tgt_node = created_nodes.get(edge_data.get("target_title", "").lower()) or next((n for n in existing_nodes if n.title.lower() == edge_data.get("target_title", "").lower()), None)
            
            if src_node and tgt_node:
                await self.graph.create_edge(
                    from_node=src_node.id,
                    to_node=tgt_node.id,
                    relationship=edge_data.get("relationship_type", "related_to")
                )

        return {"status": "success", "nodes_created": len(created_nodes)}
