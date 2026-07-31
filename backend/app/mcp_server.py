"""
Metaphor MCP Server

This module defines the MCP (Model Context Protocol) server for Metaphor.
It exposes the Context Engine as a set of MCP tools that any compatible
AI client (Claude Desktop, Cursor, ChatGPT Developer Mode, Windsurf) can
connect to and invoke.

Tools:
  - get_context: Retrieves a structured Context Package for a given query.
  - save_memory: Saves a new memory (decision, belief, constraint, etc.) to the graph.
  - search_knowledge: Searches the knowledge graph by keyword.
  - get_identity: Returns the user's identity model.
  - list_projects: Lists active projects in the knowledge graph.
"""
import logging
import json
import uuid
from datetime import datetime
from typing import Optional, List

from mcp.server.fastmcp import FastMCP

from app.context_package import (
    build_context_package,
    ContextPackage,
    IdentityModel,
)

logger = logging.getLogger("metaphor.mcp")

# ── Initialize MCP Server ───────────────────────────────────────────────────

mcp = FastMCP(
    "Metaphor",
    instructions=(
        "Metaphor is the universal context engine. "
        "It gives you the knowledge you need to understand the user, their work, and their goals. "
        "Call `get_context` at the start of every conversation to load relevant context. "
        "Call `save_memory` whenever the user makes an important decision or states a preference."
    ),
)


# ── In-Memory Store (Development) ───────────────────────────────────────────
# In production, these tools will query the Postgres + pgvector database.
# For now, we use a lightweight in-memory store so the MCP server can run
# independently without requiring Docker/Postgres.

_identity = IdentityModel()

_projects = [
    {
        "name": "Atlas",
        "status": "active",
        "summary": "AI-powered data ingestion and context chunking platform.",
        "key_decisions": [
            "Do not store raw strings in Redis. Use vector embeddings only.",
            "Pricing model must account for logarithmic scaling in VectorPipelineV2.",
        ],
    },
    {
        "name": "William",
        "status": "active",
        "summary": "AI executive agent for strategic reasoning and delegation.",
        "key_decisions": [],
    },
    {
        "name": "Clario",
        "status": "active",
        "summary": "AI companion and conversational interface.",
        "key_decisions": [],
    },
]

_memories: List[dict] = [
    {
        "id": f"mem_{uuid.uuid4().hex[:8]}",
        "type": "decision",
        "content": "Flat-rate token ingestion pricing will destroy margins at scale.",
        "source": "Claude conversation",
        "created_at": "2026-07-31T16:00:00Z",
        "project": "Atlas",
    },
    {
        "id": f"mem_{uuid.uuid4().hex[:8]}",
        "type": "constraint",
        "content": "Atlas should never store raw strings. The current fallback mechanism caches raw strings to Redis before the embedding model spins up.",
        "source": "Notion document",
        "created_at": "2026-07-30T12:00:00Z",
        "project": "Atlas",
    },
    {
        "id": f"mem_{uuid.uuid4().hex[:8]}",
        "type": "preference",
        "content": "Light mode is the default for all Metaphor interfaces.",
        "source": "Design session",
        "created_at": "2026-07-31T18:00:00Z",
        "project": "Metaphor",
    },
    {
        "id": f"mem_{uuid.uuid4().hex[:8]}",
        "type": "decision",
        "content": "Metaphor is a universal context engine, not a chatbot. It sits between all AIs and provides structured context.",
        "source": "Architecture session",
        "created_at": "2026-07-31T19:30:00Z",
        "project": "Metaphor",
    },
    {
        "id": f"mem_{uuid.uuid4().hex[:8]}",
        "type": "constraint",
        "content": "No arbitrary Tailwind values. Use semantic design tokens only. All spacing must conform to an 8pt grid.",
        "source": "Design system",
        "created_at": "2026-07-31T19:00:00Z",
        "project": "Metaphor",
    },
]

_constraints = [
    "Light mode is the default for all Metaphor interfaces.",
    "No arbitrary Tailwind values. Use semantic design tokens only.",
    "All spacing must conform to an 8pt grid.",
    "Avoid OAuth setup overhead for V1. Use developer keys first.",
    "Use Postgres + pgvector inside Docker.",
]


# ── MCP Tool Definitions ────────────────────────────────────────────────────

@mcp.tool()
def get_context(
    query: str,
    token_budget: int = 4000,
    priority_filter: str = "P1",
) -> str:
    """
    Retrieve a structured Context Package for the given query.

    Call this at the start of every conversation to load relevant user context,
    including their active objectives, relevant projects, past decisions,
    constraints, and preferences.

    Args:
        query: The user's current question, topic, or task description.
        token_budget: Maximum tokens for the context package (default 4000).
        priority_filter: Priority tier filter. "P0" = critical only, "P1" = default, "P2" = verbose.

    Returns:
        A JSON string containing the structured Context Package.
    """
    logger.info(f"[MCP] get_context called: query={query!r}, budget={token_budget}")

    # Score memories by relevance to query
    query_lower = query.lower()
    scored_memories = []
    for mem in _memories:
        content_lower = mem["content"].lower()
        # Simple keyword overlap scoring
        query_tokens = set(query_lower.split())
        content_tokens = set(content_lower.split())
        overlap = query_tokens & content_tokens
        score = len(overlap) / max(len(query_tokens), 1)
        scored_memories.append({**mem, "relevance_score": round(score, 2)})

    # Filter by relevance threshold
    threshold = 0.1 if priority_filter == "P2" else 0.2 if priority_filter == "P1" else 0.3
    relevant = [m for m in scored_memories if m["relevance_score"] >= threshold]
    relevant.sort(key=lambda m: m["relevance_score"], reverse=True)

    # Build package
    package = {
        "schema_version": "1.0",
        "package_id": f"cpkg_{uuid.uuid4().hex[:8]}",
        "generated_at": datetime.utcnow().isoformat(),
        "requesting_client": "mcp",
        "query_context": query,
        "identity": _identity.model_dump(),
        "active_objective": {
            "goal": "Design the Universal Context Engine architecture for Metaphor OS",
            "confidence": 0.92,
            "last_updated": "2026-07-31T18:30:00Z",
            "why": "Inferred from 4 conversations in the last 6 hours."
        },
        "relevant_projects": [p for p in _projects if any(
            t in query_lower for t in p["name"].lower().split()
        )] or _projects[:2],
        "relevant_memories": relevant[:5],
        "constraints": _constraints,
        "metadata": {
            "total_memories_searched": len(_memories),
            "memories_returned": len(relevant[:5]),
            "compression_ratio": f"{len(_memories)}:{len(relevant[:5])}",
        }
    }

    return json.dumps(package, indent=2, default=str)


@mcp.tool()
def save_memory(
    content: str,
    type: str = "decision",
    project: str = "",
    confidence: float = 0.85,
) -> str:
    """
    Save a new memory to the user's knowledge graph.

    Call this whenever the user makes an important decision, states a preference,
    identifies a constraint, or reaches a conclusion worth remembering.

    Args:
        content: The insight, decision, or preference to save.
        type: Memory type. One of: "decision", "belief", "preference", "constraint", "goal", "relationship".
        project: Associated project name (e.g., "Atlas", "William").
        confidence: Confidence score from 0.0 to 1.0.

    Returns:
        Confirmation with the new memory ID.
    """
    logger.info(f"[MCP] save_memory called: type={type!r}, content={content[:50]!r}")

    memory_id = f"mem_{uuid.uuid4().hex[:8]}"
    new_memory = {
        "id": memory_id,
        "type": type,
        "content": content,
        "source": "mcp",
        "created_at": datetime.utcnow().isoformat(),
        "project": project,
        "confidence": confidence,
    }
    _memories.append(new_memory)

    return json.dumps({
        "status": "saved",
        "memory_id": memory_id,
        "type": type,
        "content": content,
        "total_memories": len(_memories),
    })


@mcp.tool()
def search_knowledge(
    query: str,
    limit: int = 10,
) -> str:
    """
    Search the user's knowledge graph for relevant memories and projects.

    Args:
        query: The search term or topic.
        limit: Maximum number of results to return.

    Returns:
        A JSON string with matching memories and projects.
    """
    logger.info(f"[MCP] search_knowledge called: query={query!r}")
    query_lower = query.lower()

    matching_memories = [
        m for m in _memories
        if query_lower in m["content"].lower()
    ][:limit]

    matching_projects = [
        p for p in _projects
        if query_lower in p["name"].lower() or query_lower in p["summary"].lower()
    ][:limit]

    return json.dumps({
        "query": query,
        "memories": matching_memories,
        "projects": matching_projects,
        "total_results": len(matching_memories) + len(matching_projects),
    }, default=str)


@mcp.tool()
def get_identity() -> str:
    """
    Get the user's identity model.

    Returns their name, mission, writing style, and preferred terminology.
    Call this when you need to understand who the user is and how they prefer
    to communicate.

    Returns:
        A JSON string with the user's identity model.
    """
    logger.info("[MCP] get_identity called")
    return json.dumps(_identity.model_dump())


@mcp.tool()
def list_projects(
    status: str = "active",
) -> str:
    """
    List the user's projects.

    Args:
        status: Filter by status. One of: "active", "archived", "all".

    Returns:
        A JSON string with project details.
    """
    logger.info(f"[MCP] list_projects called: status={status!r}")

    if status == "all":
        filtered = _projects
    else:
        filtered = [p for p in _projects if p["status"] == status]

    return json.dumps({
        "projects": filtered,
        "total": len(filtered),
    })
