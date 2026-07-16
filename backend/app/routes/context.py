import logging
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, desc
from pydantic import BaseModel

from app.database import get_session
from app.config import settings
from app.models import Node, Edge, Chunk
from app.provider import llm_provider

logger = logging.getLogger("metaphor.routes.context")
router = APIRouter()


# ── Auth ────────────────────────────────────────────────────────────────────
async def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != settings.METAPHOR_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid API Key")
    return x_api_key


# ── Schemas ──────────────────────────────────────────────────────────────────
class SnapshotRequest(BaseModel):
    """
    A machine-callable request for a tailored context snapshot.

    Fields:
        consumer: The calling system (e.g. "William", "Atlas", "Weave")
        intent:   What the consumer needs context for (e.g. "morning_brief",
                  "project_status", "decision_support", "general")
        filters:  Optional filters — node types, dimensions, or keywords to
                  narrow the graph traversal.
    """
    consumer: str = "general"
    intent: str = "general"
    filters: Optional[Dict[str, Any]] = None


class SnapshotResponse(BaseModel):
    consumer: str
    intent: str
    generated_at: str
    graph_summary: Dict[str, Any]
    active_projects: List[Dict[str, Any]]
    recent_decisions: List[Dict[str, Any]]
    key_people: List[Dict[str, Any]]
    recent_commits: List[Dict[str, Any]]
    open_ideas: List[Dict[str, Any]]
    narrative: str  # Claude-generated natural language synthesis


# ── Helpers ──────────────────────────────────────────────────────────────────
def _serialize_node(n: Node) -> Dict[str, Any]:
    return {
        "id": str(n.id),
        "name": n.name,
        "type": n.type,
        "metadata": n.metadata_json,
        "created_at": n.created_at.isoformat(),
        "updated_at": n.updated_at.isoformat(),
    }


def _serialize_edge(e: Edge) -> Dict[str, Any]:
    return {
        "id": str(e.id),
        "source": str(e.source_id),
        "target": str(e.target_id),
        "dimension": e.dimension,
        "relationship_type": e.relationship_type,
    }


# ── Route ────────────────────────────────────────────────────────────────────
@router.post("/context/snapshot", response_model=SnapshotResponse)
async def get_context_snapshot(
    req: SnapshotRequest,
    session: AsyncSession = Depends(get_session),
    api_key: str = Depends(verify_api_key),
):
    """
    Context-as-a-Service endpoint.

    Machines (William, Atlas, Weave, …) call this to receive a structured,
    narrative-enriched snapshot of Benjamin's current world model — filtered
    and narrated for their specific consumer intent.

    The response contains:
    - Structured node categories (projects, decisions, people, ideas, commits)
    - A graph-level summary (node/edge counts, density)
    - A Claude-generated narrative paragraph tailored to the consumer + intent
    """
    logger.info(f"[context/snapshot] consumer={req.consumer!r}  intent={req.intent!r}")

    try:
        # ── 1. Pull the full graph ─────────────────────────────────────────
        nodes_q = await session.exec(select(Node).order_by(desc(Node.updated_at)))
        all_nodes: List[Node] = nodes_q.all()

        edges_q = await session.exec(select(Edge))
        all_edges: List[Edge] = edges_q.all()

        # ── 2. Partition by type ───────────────────────────────────────────
        by_type: Dict[str, List[Node]] = {}
        for n in all_nodes:
            by_type.setdefault(n.type.lower(), []).append(n)

        projects   = [_serialize_node(n) for n in by_type.get("project",  [])[:10]]
        decisions  = [_serialize_node(n) for n in by_type.get("decision", [])[:10]]
        people     = [_serialize_node(n) for n in by_type.get("person",   [])[:10]]
        commits    = [_serialize_node(n) for n in by_type.get("commit",   [])[:10]]
        ideas      = [_serialize_node(n) for n in by_type.get("idea",     [])[:10]]

        # ── 3. Graph-level summary ─────────────────────────────────────────
        edge_count = len(all_edges)
        node_count = len(all_nodes)
        type_distribution = {t: len(v) for t, v in by_type.items()}

        graph_summary = {
            "total_nodes": node_count,
            "total_edges": edge_count,
            "type_distribution": type_distribution,
            "edge_dimensions": {
                dim: sum(1 for e in all_edges if e.dimension == dim)
                for dim in ["structural", "semantic", "temporal"]
            },
        }

        # ── 4. Build compact graph text for Claude ─────────────────────────
        node_lines = "\n".join(
            f"  [{n['type'].upper()}] {n['name']}" for n in
            (projects + decisions + people + commits + ideas)
        )
        edge_lines = "\n".join(
            f"  {str(e.source_id)[:8]} --[{e.relationship_type}/{e.dimension}]--> {str(e.target_id)[:8]}"
            for e in all_edges[:40]  # cap for token budget
        )
        graph_text = f"Nodes:\n{node_lines or '  (none yet)'}\n\nEdges (sample):\n{edge_lines or '  (none yet)'}"

        # ── 5. Ask Claude for a narrative synthesis ────────────────────────
        system_prompt = (
            "You are the Metaphor Context Engine. Your role is to synthesise the user's "
            "world model graph into a compact, accurate narrative for a specific AI consumer. "
            "Do not hallucinate. Use only the data provided. Be concise (3-5 sentences max). "
            "Write in the third person about the user ('Benjamin')."
        )
        user_prompt = (
            f"Consumer: {req.consumer}\n"
            f"Intent: {req.intent}\n\n"
            f"Current World Model Graph:\n{graph_text}\n\n"
            f"Write a narrative synthesis tailored to this consumer and intent. "
            f"Highlight what is most relevant for {req.consumer} given intent '{req.intent}'."
        )

        narrative = "(No LLM configured)"
        try:
            llm_response = await llm_provider.query_claude(
                system_prompt=system_prompt,
                prompt=user_prompt,
                max_tokens=512,
            )
            narrative = llm_response.strip()
        except Exception as llm_err:
            logger.warning(f"LLM narrative generation failed: {llm_err}. Returning raw graph only.")

        return SnapshotResponse(
            consumer=req.consumer,
            intent=req.intent,
            generated_at=datetime.utcnow().isoformat() + "Z",
            graph_summary=graph_summary,
            active_projects=projects,
            recent_decisions=decisions,
            key_people=people,
            recent_commits=commits,
            open_ideas=ideas,
            narrative=narrative,
        )

    except Exception as e:
        logger.error(f"[context/snapshot] Error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Context snapshot failed: {str(e)}")
