import json
import logging
from datetime import datetime
from typing import List, Dict, Any
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Node, Edge, Chunk, NodeEvidence
from app.provider import llm_provider
from app.database import get_session

logger = logging.getLogger("metaphor.reflection")

class ReflectionEngine:
    def __init__(self):
        pass

    async def reflect_and_evolve(self, session: AsyncSession, raw_logs: List[Dict[str, Any]], status: str = "approved") -> Dict[str, Any]:
        """
        Run the Reflection Agent using Anthropic Claude.
        1. Ingest raw log text.
        2. Read existing nodes from DB for reference (context mapping).
        3. Prompt Claude to extract structured Objects, Edges, and Evidence links.
        4. Commit changes to PostgreSQL.
        """
        if not raw_logs:
            logger.info("No raw logs to reflect on.")
            return {"status": "success", "message": "No logs provided"}

        # 1. Fetch existing graph nodes to prevent duplicate objects and map connections
        existing_nodes_query = await session.exec(select(Node))
        existing_nodes = existing_nodes_query.all()
        existing_nodes_context = [
            {"id": str(n.id), "name": n.name, "type": n.type}
            for n in existing_nodes
        ]

        # Prepare log summary for LLM
        formatted_logs = []
        for log in raw_logs:
            formatted_logs.append(
                f"Log ID: {log['id']}\n"
                f"Source: {log['source']}\n"
                f"Title: {log['title']}\n"
                f"Content:\n{log['content']}\n"
                f"Metadata: {json.dumps(log['metadata'])}\n"
                f"---"
            )
        logs_text = "\n\n".join(formatted_logs)

        # 2. Build system and user prompt for Claude
        system_prompt = (
            "You are the Metaphor World Modeling Reflection Engine.\n"
            "Your objective is to model the user's world. Instead of indexing isolated documents, "
            "you identify the underlying Objects (Nodes) and the Relationships (Edges) between them.\n"
            "Objects can be:\n"
            "- Person (e.g. Benjamin, Sarah)\n"
            "- Meeting (e.g. Pricing Sync)\n"
            "- Idea (e.g. Context API)\n"
            "- Decision (e.g. V1 Developer Keys First)\n"
            "- Commit (e.g. git commit messages)\n"
            "- Project (e.g. Metaphor, Atlas, William)\n\n"
            "Relationships must be categorized into three dimensions:\n"
            "- Structural: Hierarchy or ownership (e.g. Project contains Idea)\n"
            "- Semantic: Semantic association or thematic relevance (e.g. Idea relates to Project)\n"
            "- Temporal: Causal, chronological, or event sequencing (e.g. Meeting created Idea -> Idea led to Decision -> Decision implemented in Commit)\n\n"
            "Ensure you resolve names to existing nodes to connect logs into the unified graph."
        )

        prompt = (
            f"Here are the existing nodes in Metaphor's graph database:\n"
            f"{json.dumps(existing_nodes_context, indent=2)}\n\n"
            f"Here are the new incoming workspace log documents that have been synced:\n"
            f"{logs_text}\n\n"
            f"Task: Extract the core Objects, their Relationships (Edges), and link the raw logs (referenced by Log ID) as Evidence to the appropriate Objects.\n"
            f"Respond STRICTLY in JSON format with no additional conversation. Use this exact schema:\n"
            f"{{\n"
            f"  \"nodes_to_create\": [\n"
            f"    {{\"name\": \"Object Name\", \"type\": \"Person|Meeting|Idea|Decision|Commit|Project\", \"metadata\": {{...}}}}\n"
            f"  ],\n"
            f"  \"edges_to_create\": [\n"
            f"    {{\"source_node_name\": \"Name\", \"target_node_name\": \"Name\", \"dimension\": \"structural|semantic|temporal\", \"relationship_type\": \"caused_by|contains|evidence_for|decided_in|implemented_in|etc\", \"description\": \"Why/how are they related?\"}}\n"
            f"  ],\n"
            f"  \"evidence_links\": [\n"
            f"    {{\"node_name\": \"Object Name\", \"log_id\": \"Log ID\"}}\n"
            f"  ]\n"
            f"}}\n"
        )

        # 3. Call Claude
        logger.info("Calling Claude for reflection extraction...")
        response_text = await llm_provider.query_claude(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.0
        )

        try:
            # Parse response
            # Sometimes Claude returns code block formatting, strip it
            clean_response = response_text.strip()
            if clean_response.startswith("```json"):
                clean_response = clean_response[7:]
            if clean_response.endswith("```"):
                clean_response = clean_response[:-3]
            
            result = json.loads(clean_response)
        except Exception as e:
            logger.error(f"Failed to parse Claude reflection JSON: {e}. Raw response: {response_text}")
            # Fallback mock database evolution if LLM keys are not configured or parse error
            result = self._get_mock_reflection_results(raw_logs)

        # 4. Write data to DB inside transaction
        report = await self._apply_graph_updates(session, raw_logs, result, status=status)
        return report

    async def _apply_graph_updates(self, session: AsyncSession, raw_logs: List[Dict[str, Any]], parsed_updates: Dict[str, Any], status: str = "approved") -> Dict[str, Any]:
        """Apply extracted nodes, edges, chunks and evidence linkages to Postgres."""
        
        # A. Store raw logs as Chunks and compute embeddings
        chunk_map = {} # Maps log_id to Chunk object
        for log in raw_logs:
            # Check if chunk exists
            existing_chunk_q = await session.exec(select(Chunk).where(Chunk.metadata_json["log_id"] == log["id"]))
            chunk = existing_chunk_q.first()
            if not chunk:
                # Create embedding
                embedding = await llm_provider.generate_embedding(log["content"])
                chunk = Chunk(
                    text_content=log["content"],
                    embedding=embedding,
                    metadata_json={"log_id": log["id"], "title": log["title"], "source": log["source"], **log["metadata"]}
                )
                session.add(chunk)
                await session.flush() # Populate chunk ID
            chunk_map[log["id"]] = chunk

        # B. Resolve or Create Nodes
        node_map = {} # Maps lowercase node name to Node object
        
        # Load existing nodes into node_map
        existing_nodes_q = await session.exec(select(Node))
        for n in existing_nodes_q.all():
            node_map[n.name.lower()] = n

        created_nodes_count = 0
        for n_data in parsed_updates.get("nodes_to_create", []):
            name = n_data["name"]
            n_type = n_data["type"]
            metadata = n_data.get("metadata", {})
            
            if name.lower() not in node_map:
                node = Node(
                    name=name,
                    type=n_type,
                    metadata_json=metadata,
                    status=status
                )
                session.add(node)
                await session.flush()
                node_map[name.lower()] = node
                created_nodes_count += 1
            else:
                # Node already exists, update metadata if relevant
                node = node_map[name.lower()]
                node.metadata_json.update(metadata)
                session.add(node)

        # C. Create Evidence Links
        evidence_links_count = 0
        for link in parsed_updates.get("evidence_links", []):
            node_name = link["node_name"]
            log_id = link["log_id"]
            
            node = node_map.get(node_name.lower())
            chunk = chunk_map.get(log_id)
            
            if node and chunk:
                # Check if association already exists
                assoc_q = await session.exec(
                    select(NodeEvidence).where(NodeEvidence.node_id == node.id, NodeEvidence.chunk_id == chunk.id)
                )
                if not assoc_q.first():
                    assoc = NodeEvidence(node_id=node.id, chunk_id=chunk.id)
                    session.add(assoc)
                    evidence_links_count += 1

        # D. Create Edges
        created_edges_count = 0
        for edge_data in parsed_updates.get("edges_to_create", []):
            src_name = edge_data["source_node_name"]
            tgt_name = edge_data["target_node_name"]
            dim = edge_data["dimension"]
            rel_type = edge_data["relationship_type"]
            desc = edge_data.get("description", "")

            src_node = node_map.get(src_name.lower())
            tgt_node = node_map.get(tgt_name.lower())

            if src_node and tgt_node:
                # Check if edge already exists
                existing_edge_q = await session.exec(
                    select(Edge).where(
                        Edge.source_id == src_node.id,
                        Edge.target_id == tgt_node.id,
                        Edge.dimension == dim,
                        Edge.relationship_type == rel_type
                    )
                )
                if not existing_edge_q.first():
                    edge = Edge(
                        source_id=src_node.id,
                        target_id=tgt_node.id,
                        dimension=dim,
                        relationship_type=rel_type,
                        metadata_json={"description": desc},
                        status=status
                    )
                    session.add(edge)
                    created_edges_count += 1

        await session.commit()
        
        return {
            "status": "success",
            "nodes_created": created_nodes_count,
            "edges_created": created_edges_count,
            "evidence_links_created": evidence_links_count
        }

    def _get_mock_reflection_results(self, raw_logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Provides high-quality structured evolution mock database objects when LLM is unavailable."""
        logger.info("Mocking graph relationships from simulated development logs...")
        
        nodes = [
            {"name": "Atlas", "type": "Project", "metadata": {"description": "Business constraints and pricing models"}},
            {"name": "William", "type": "Project", "metadata": {"description": "Task execution coordinator"}},
            {"name": "Metaphor", "type": "Project", "metadata": {"description": "Context and World Modeling Engine"}},
            {"name": "Benjamin", "type": "Person", "metadata": {"role": "Technical Founder"}},
            {"name": "Sarah", "type": "Person", "metadata": {"role": "CEO of TechFounder Inc / Customer"}},
            {"name": "Ideal Customer Profile", "type": "Idea", "metadata": {"focus": "Technical B2B SaaS teams"}},
            {"name": "Value-based Pricing", "type": "Idea", "metadata": {"proposed_amount": 500}},
            {"name": "Developer Keys First", "type": "Decision", "metadata": {"rationale": "Avoid Google/Notion OAuth setup bottleneck in V1"}},
            {"name": "Docker Local Database", "type": "Decision", "metadata": {"database": "Postgres 16 + pgvector"}},
            {"name": "Integrate Docker DB Commit", "type": "Commit", "metadata": {"sha": "a1b2c3d4e5f6"}},
            {"name": "Update Pricing Rules Commit", "type": "Commit", "metadata": {"sha": "f6e5d4c3b2a1"}},
            {"name": "Sarah Client Sync", "type": "Meeting", "metadata": {"date": "2026-07-15"}},
            {"name": "Metaphor Brainstorming session", "type": "Meeting", "metadata": {"date": "2026-07-16"}},
        ]

        edges = [
            # Structural
            {"source_node_name": "Atlas", "target_node_name": "Ideal Customer Profile", "dimension": "structural", "relationship_type": "contains", "description": "Atlas business plan defines the Ideal Customer Profile."},
            {"source_node_name": "Atlas", "target_node_name": "Value-based Pricing", "dimension": "structural", "relationship_type": "contains", "description": "Atlas business plan incorporates the Value-based Pricing proposal."},
            
            # Semantic
            {"source_node_name": "William", "target_node_name": "Atlas", "dimension": "semantic", "relationship_type": "relates_to", "description": "William requires Atlas budget constraints to safely execute deployments."},
            {"source_node_name": "Metaphor", "target_node_name": "William", "dimension": "semantic", "relationship_type": "relates_to", "description": "Metaphor feeds context to William."},
            {"source_node_name": "Metaphor", "target_node_name": "Atlas", "dimension": "semantic", "relationship_type": "relates_to", "description": "Metaphor manages relational states defined by Atlas."},

            # Temporal / Causal
            {"source_node_name": "Sarah Client Sync", "target_node_name": "Value-based Pricing", "dimension": "temporal", "relationship_type": "discussed", "description": "Sarah reviewed and supported the $500 monthly pricing during the review sync."},
            {"source_node_name": "Sarah Client Sync", "target_node_name": "Sarah", "dimension": "structural", "relationship_type": "attendee", "description": "Sarah attended the customer call."},
            {"source_node_name": "Sarah Client Sync", "target_node_name": "Benjamin", "dimension": "structural", "relationship_type": "attendee", "description": "Benjamin hosted the customer call."},
            
            {"source_node_name": "Sarah Client Sync", "target_node_name": "Metaphor Brainstorming session", "dimension": "temporal", "relationship_type": "caused", "description": "Customer feedback on a unified timeline during the sync caused the team to host a brainstorming session for Metaphor."},
            {"source_node_name": "Metaphor Brainstorming session", "target_node_name": "Developer Keys First", "dimension": "temporal", "relationship_type": "decided", "description": "Metaphor sync session concluded that developer keys should take priority over full OAuth for V1."},
            {"source_node_name": "Metaphor Brainstorming session", "target_node_name": "Docker Local Database", "dimension": "temporal", "relationship_type": "decided", "description": "Decided to host Postgres + pgvector inside Docker locally."},

            {"source_node_name": "Docker Local Database", "target_node_name": "Integrate Docker DB Commit", "dimension": "temporal", "relationship_type": "implemented_by", "description": "Docker Local DB decision was implemented in commit a1b2c3d4e5f6."},
            {"source_node_name": "Value-based Pricing", "target_node_name": "Update Pricing Rules Commit", "dimension": "temporal", "relationship_type": "implemented_by", "description": "Pricing tier configuration was updated in William codebase under commit f6e5d4c3b2a1."}
        ]

        evidence = []
        # Find matching nodes for evidence links based on mock log ids
        for log in raw_logs:
            if "page_1" in log["id"]:
                evidence.append({"node_name": "Ideal Customer Profile", "log_id": log["id"]})
            elif "page_2" in log["id"]:
                evidence.append({"node_name": "Value-based Pricing", "log_id": log["id"]})
            elif "page_3" in log["id"]:
                evidence.append({"node_name": "William", "log_id": log["id"]})
            elif "commit_mock_1" in log["id"]:
                evidence.append({"node_name": "Integrate Docker DB Commit", "log_id": log["id"]})
            elif "commit_mock_2" in log["id"]:
                evidence.append({"node_name": "Update Pricing Rules Commit", "log_id": log["id"]})
            elif "drive_mock_1" in log["id"]:
                evidence.append({"node_name": "Sarah Client Sync", "log_id": log["id"]})
            elif "calendar_mock_1" in log["id"]:
                evidence.append({"node_name": "Sarah Client Sync", "log_id": log["id"]})
            elif "calendar_mock_2" in log["id"]:
                evidence.append({"node_name": "Metaphor Brainstorming session", "log_id": log["id"]})

        return {
            "nodes_to_create": nodes,
            "edges_to_create": edges,
            "evidence_links": evidence
        }

reflection_engine = ReflectionEngine()
