import logging
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import uuid

from app.database import get_session
from app.config import settings
from app.models import Node, Edge, Chunk, NodeEvidence
from app.provider import llm_provider

logger = logging.getLogger("metaphor.routes.graph")
router = APIRouter()

# API authentication utility
async def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != settings.METAPHOR_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid API Key")
    return x_api_key

# Request / Response Schemas
class GraphRequest(BaseModel):
    dimensions: Optional[List[str]] = None # List of "structural", "semantic", "temporal"
    node_types: Optional[List[str]] = None

class GraphResponse(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

class ExplainRequest(BaseModel):
    node_a_name: str
    node_b_name: str

class HistoryResponse(BaseModel):
    timeline: List[Dict[str, Any]]

@router.post("/graph", response_model=GraphResponse)
async def get_graph(
    req: Optional[GraphRequest] = None,
    session: AsyncSession = Depends(get_session),
    api_key: str = Depends(verify_api_key)
):
    """Retrieve the nodes and edges filtering by dimensions or types."""
    try:
        # Load all nodes
        nodes_q = await session.exec(select(Node))
        nodes = nodes_q.all()
        
        # Load all edges
        edges_q = await session.exec(select(Edge))
        edges = edges_q.all()

        # Apply filtering
        filtered_nodes = nodes
        if req and req.node_types:
            filtered_nodes = [n for n in nodes if n.type in req.node_types]

        node_ids = {n.id for n in filtered_nodes}

        filtered_edges = []
        for e in edges:
            # Verify endpoints exist in filtered set
            if e.source_id in node_ids and e.target_id in node_ids:
                if req and req.dimensions and e.dimension not in req.dimensions:
                    continue
                filtered_edges.append(e)

        return GraphResponse(
            nodes=[
                {
                    "id": str(n.id),
                    "name": n.name,
                    "type": n.type,
                    "metadata": n.metadata_json,
                    "created_at": n.created_at.isoformat()
                }
                for n in filtered_nodes
            ],
            edges=[
                {
                    "id": str(e.id),
                    "source": str(e.source_id),
                    "target": str(e.target_id),
                    "dimension": e.dimension,
                    "type": e.relationship_type,
                    "weight": e.weight,
                    "description": e.metadata_json.get("description", ""),
                    "created_at": e.created_at.isoformat()
                }
                for e in filtered_edges
            ]
        )
    except Exception as e:
        logger.error(f"Error retrieving subgraph: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain")
async def explain_relationship(
    req: ExplainRequest,
    session: AsyncSession = Depends(get_session),
    api_key: str = Depends(verify_api_key)
):
    """
    Find paths between two nodes, gather relevant evidence, 
    and ask Claude to explain their relation.
    """
    try:
        # Find Node A
        node_a_q = await session.exec(select(Node).where(Node.name == req.node_a_name))
        node_a = node_a_q.first()
        # Find Node B
        node_b_q = await session.exec(select(Node).where(Node.name == req.node_b_name))
        node_b = node_b_q.first()

        if not node_a or not node_b:
            raise HTTPException(status_code=404, detail="One or both nodes not found")

        # Gather evidence chunks for Node A and Node B
        chunks_a_q = await session.exec(
            select(Chunk).join(NodeEvidence).where(NodeEvidence.node_id == node_a.id)
        )
        chunks_a = chunks_a_q.all()
        evidence_a = "\n".join([f"- {c.text_content[:300]}..." for c in chunks_a])

        chunks_b_q = await session.exec(
            select(Chunk).join(NodeEvidence).where(NodeEvidence.node_id == node_b.id)
        )
        chunks_b = chunks_b_q.all()
        evidence_b = "\n".join([f"- {c.text_content[:300]}..." for c in chunks_b])

        # Fetch direct paths between A and B
        edges_q = await session.exec(
            select(Edge).where(
                ((Edge.source_id == node_a.id) & (Edge.target_id == node_b.id)) |
                ((Edge.source_id == node_b.id) & (Edge.target_id == node_a.id))
            )
        )
        edges = edges_q.all()
        direct_paths = []
        for e in edges:
            direct_paths.append(
                f"- Connection: {req.node_a_name} -> {req.node_b_name} | Dimension: {e.dimension} | Relation: {e.relationship_type} | Desc: {e.metadata_json.get('description', '')}"
            )
        paths_text = "\n".join(direct_paths) if direct_paths else "- No direct edges between them, searching graph paths."

        # Prompt Claude to explain relationship
        system_prompt = "You are Metaphor's Context Explainer. You translate graph database paths and source evidence into human explanations."
        
        prompt = (
            f"Please explain how '{node_a.name}' ({node_a.type}) relates to '{node_b.name}' ({node_b.type}) in the user's workspace.\n\n"
            f"Graph Path Context:\n"
            f"{paths_text}\n\n"
            f"Evidence supporting '{node_a.name}':\n"
            f"{evidence_a or '- No direct evidence text stored.'}\n\n"
            f"Evidence supporting '{node_b.name}':\n"
            f"{evidence_b or '- No direct evidence text stored.'}\n\n"
            f"Synthesize this context. Explain: \n"
            f"1. The causal or chronological chain of connection (how they relate in time, e.g., meetings, commits, ideas).\n"
            f"2. The logical/structural relationship (projects, people).\n"
            f"3. What this connection actually means for the founder."
        )

        explanation = await llm_provider.query_claude(prompt=prompt, system_prompt=system_prompt)
        
        return {
            "node_a": node_a.name,
            "node_b": node_b.name,
            "explanation": explanation
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error explaining relationship: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/history", response_model=HistoryResponse)
async def get_history(
    session: AsyncSession = Depends(get_session),
    api_key: str = Depends(verify_api_key)
):
    """
    Returns a chronological sequence of temporal nodes and edges representing 
    the evolution of decisions, ideas, meetings, commits, and feedback.
    """
    try:
        # Load all nodes of event/decision types
        event_types = ["Meeting", "Idea", "Decision", "Commit", "Feedback"]
        nodes_q = await session.exec(select(Node).where(Node.type.in_(event_types)))
        nodes = nodes_q.all()

        # Load all temporal edges
        edges_q = await session.exec(select(Edge).where(Edge.dimension == "temporal"))
        edges = edges_q.all()

        # Build list of items with dates
        timeline = []
        for n in nodes:
            # Look for a start_time or date in metadata, fallback to created_at
            meta = n.metadata_json or {}
            date_str = meta.get("date") or meta.get("start_time") or meta.get("created_at")
            
            # Try parsing or fallback
            event_date = n.created_at
            if date_str:
                try:
                    # Strip Z and load
                    if date_str.endswith("Z"):
                        date_str = date_str[:-1]
                    event_date = datetime.fromisoformat(date_str)
                except Exception:
                    pass

            timeline.append({
                "id": str(n.id),
                "name": n.name,
                "type": n.type,
                "metadata": meta,
                "date": event_date.isoformat(),
                "display_date": event_date.strftime("%B %d, %Y %H:%M")
            })

        # Sort timeline chronologically
        timeline.sort(key=lambda x: x["date"])

        # Map temporal relationships
        # For each node, find what temporal edges lead out of it
        for item in timeline:
            outgoing = []
            for e in edges:
                if str(e.source_id) == item["id"]:
                    # Find target node name
                    target_name = "Unknown"
                    for tn in nodes:
                        if str(tn.id) == str(e.target_id):
                            target_name = tn.name
                            break
                    outgoing.append({
                        "target_id": str(e.target_id),
                        "target_name": target_name,
                        "type": e.relationship_type,
                        "description": e.metadata_json.get("description", "")
                    })
            item["causes"] = outgoing

        return HistoryResponse(timeline=timeline)
    except Exception as e:
        logger.error(f"Error fetching temporal history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
