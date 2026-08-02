import uuid
import time
import json
import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from fastapi import HTTPException
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.graph import Node, Edge
from app.services.graph import GraphService
from app.services.context import ContextService
from app.models.operations import MCPAuditLog

logger = logging.getLogger("metaphor.mcp_server")

def hash_token(raw_token: str) -> str:
    import hashlib
    return hashlib.sha256(raw_token.encode()).hexdigest()

# ── In-Memory Active SSE Stream Tracker for Immediate Revocation Termination ─────
# Maps token_id (str) -> List of shutdown events
ACTIVE_SSE_STREAMS: Dict[str, List[asyncio.Event]] = {}

def register_sse_stream(token_id: str) -> asyncio.Event:
    shutdown_event = asyncio.Event()
    if token_id not in ACTIVE_SSE_STREAMS:
        ACTIVE_SSE_STREAMS[token_id] = []
    ACTIVE_SSE_STREAMS[token_id].append(shutdown_event)
    return shutdown_event

def unregister_sse_stream(token_id: str, shutdown_event: asyncio.Event):
    if token_id in ACTIVE_SSE_STREAMS:
        if shutdown_event in ACTIVE_SSE_STREAMS[token_id]:
            ACTIVE_SSE_STREAMS[token_id].remove(shutdown_event)
        if not ACTIVE_SSE_STREAMS[token_id]:
            del ACTIVE_SSE_STREAMS[token_id]

def terminate_active_sse_streams(token_id: str):
    if token_id in ACTIVE_SSE_STREAMS:
        logger.info(f"Terminating active SSE streams for revoked token {token_id}")
        for event in ACTIVE_SSE_STREAMS[token_id]:
            event.set()
        del ACTIVE_SSE_STREAMS[token_id]


# ── Sliding Window Rate Limiter (30 requests / 60 seconds per token) ───────────
RATE_LIMIT_STORE: Dict[str, List[float]] = {}
MAX_REQUESTS_PER_MINUTE = 30
WINDOW_SECONDS = 60.0

def enforce_token_rate_limit(token_id: str):
    now = time.time()
    if token_id not in RATE_LIMIT_STORE:
        RATE_LIMIT_STORE[token_id] = []
    
    # Remove timestamps older than window
    RATE_LIMIT_STORE[token_id] = [t for t in RATE_LIMIT_STORE[token_id] if now - t < WINDOW_SECONDS]
    
    if len(RATE_LIMIT_STORE[token_id]) >= MAX_REQUESTS_PER_MINUTE:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded for this MCP token. Maximum 30 requests per minute allowed.",
            headers={"Retry-After": "60"}
        )
    
    RATE_LIMIT_STORE[token_id].append(now)


# ── Tenant-Isolated Resource Resolvers ─────────────────────────────────────────
async def list_mcp_resources() -> List[Dict[str, Any]]:
    return [
        {"uri": "workspace://projects", "name": "Projects", "description": "Active workspace projects & sprint goals", "mimeType": "application/json"},
        {"uri": "workspace://docs", "name": "Documentation", "description": "Technical specs, design docs, and guides", "mimeType": "application/json"},
        {"uri": "workspace://graph", "name": "Knowledge Graph", "description": "Context graph summary & node topology", "mimeType": "application/json"},
        {"uri": "workspace://architecture", "name": "Architecture", "description": "Architectural decisions and design constraints", "mimeType": "application/json"},
        {"uri": "workspace://meetings", "name": "Meetings", "description": "Meeting summaries and decision logs", "mimeType": "application/json"},
        {"uri": "workspace://repositories", "name": "Repositories", "description": "Ingested repositories, codebase files, and commits", "mimeType": "application/json"},
    ]

async def read_mcp_resource(uri: str, organization_id: uuid.UUID, session: AsyncSession) -> Dict[str, Any]:
    # Every query strictly filters by organization_id
    if uri == "workspace://projects":
        stmt = select(Node).where(Node.organization_id == organization_id, Node.node_type == "project")
        res = await session.execute(stmt)
        nodes = res.scalars().all()
        return {"uri": uri, "contents": [{"text": json.dumps([{"id": str(n.id), "title": n.title, "summary": n.summary, "properties": n.properties} for n in nodes], indent=2)}]}
    
    elif uri == "workspace://docs":
        stmt = select(Node).where(Node.organization_id == organization_id, Node.node_type.in_(["doc", "document", "spec"]))
        res = await session.execute(stmt)
        nodes = res.scalars().all()
        return {"uri": uri, "contents": [{"text": json.dumps([{"id": str(n.id), "title": n.title, "summary": n.summary, "source": n.source} for n in nodes], indent=2)}]}

    elif uri == "workspace://graph":
        node_stmt = select(Node).where(Node.organization_id == organization_id)
        n_res = await session.execute(node_stmt)
        nodes = n_res.scalars().all()
        
        edge_stmt = select(Edge).where(Edge.organization_id == organization_id)
        e_res = await session.execute(edge_stmt)
        edges = e_res.scalars().all()
        
        return {"uri": uri, "contents": [{"text": json.dumps({"organization_id": str(organization_id), "total_nodes": len(nodes), "total_edges": len(edges), "node_types": list(set(n.node_type for n in nodes))}, indent=2)}]}

    elif uri == "workspace://architecture":
        stmt = select(Node).where(Node.organization_id == organization_id, Node.node_type.in_(["architecture", "decision", "adr"]))
        res = await session.execute(stmt)
        nodes = res.scalars().all()
        return {"uri": uri, "contents": [{"text": json.dumps([{"id": str(n.id), "title": n.title, "summary": n.summary} for n in nodes], indent=2)}]}

    elif uri == "workspace://meetings":
        stmt = select(Node).where(Node.organization_id == organization_id, Node.node_type.in_(["meeting", "notes"]))
        res = await session.execute(stmt)
        nodes = res.scalars().all()
        return {"uri": uri, "contents": [{"text": json.dumps([{"id": str(n.id), "title": n.title, "summary": n.summary} for n in nodes], indent=2)}]}

    elif uri == "workspace://repositories":
        stmt = select(Node).where(Node.organization_id == organization_id, Node.node_type.in_(["repo", "repository", "code"]))
        res = await session.execute(stmt)
        nodes = res.scalars().all()
        return {"uri": uri, "contents": [{"text": json.dumps([{"id": str(n.id), "title": n.title, "summary": n.summary, "properties": n.properties} for n in nodes], indent=2)}]}

    else:
        raise HTTPException(status_code=404, detail=f"Resource '{uri}' not found.")


# ── Tenant-Isolated Read-Only Tools Resolvers ──────────────────────────────────
async def list_mcp_tools() -> List[Dict[str, Any]]:
    return [
        {"name": "search_context", "description": "Semantic context search across workspace memory.", "inputSchema": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}},
        {"name": "retrieve_documents", "description": "Lookup workspace documentation.", "inputSchema": {"type": "object", "properties": {"limit": {"type": "integer", "default": 10}}}},
        {"name": "find_related", "description": "Find connected graph relationships for an entity.", "inputSchema": {"type": "object", "properties": {"entity_name": {"type": "string"}}, "required": ["entity_name"]}},
        {"name": "explain_architecture", "description": "Retrieve architectural decisions & design rules.", "inputSchema": {"type": "object", "properties": {}}},
        {"name": "answer_from_workspace", "description": "High-confidence workspace answer using Context Engine.", "inputSchema": {"type": "object", "properties": {"question": {"type": "string"}}, "required": ["question"]}},
        {"name": "get_project", "description": "Get detailed breakdown of a workspace project.", "inputSchema": {"type": "object", "properties": {"project_name": {"type": "string"}}, "required": ["project_name"]}},
        {"name": "resolve_entity", "description": "Disambiguate an ambiguous entity in the workspace.", "inputSchema": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}},
        {"name": "list_recent_changes", "description": "List latest commits, decisions, and ingested events.", "inputSchema": {"type": "object", "properties": {}}},
    ]

async def call_mcp_tool(name: str, arguments: Dict[str, Any], organization_id: uuid.UUID, session: AsyncSession) -> Dict[str, Any]:
    # Every tool query strictly filters by organization_id
    if name == "search_context":
        query = arguments.get("query", "")
        graph = GraphService(session)
        ctx_service = ContextService(session, graph)
        package = await ctx_service.generate_context_package(organization_id, "mcp", query)
        return {"content": [{"type": "text", "text": json.dumps(package.package_json, indent=2)}]}

    elif name == "retrieve_documents":
        limit = arguments.get("limit", 10)
        stmt = select(Node).where(Node.organization_id == organization_id, Node.node_type.in_(["doc", "document", "spec"])).limit(limit)
        res = await session.execute(stmt)
        nodes = res.scalars().all()
        return {"content": [{"type": "text", "text": json.dumps([{"id": str(n.id), "title": n.title, "summary": n.summary, "source": n.source} for n in nodes], indent=2)}]}

    elif name == "find_related":
        entity_name = arguments.get("entity_name", "")
        stmt = select(Node).where(Node.organization_id == organization_id, Node.title.ilike(f"%{entity_name}%"))
        res = await session.execute(stmt)
        nodes = res.scalars().all()
        return {"content": [{"type": "text", "text": json.dumps([{"id": str(n.id), "title": n.title, "summary": n.summary} for n in nodes], indent=2)}]}

    elif name == "explain_architecture":
        stmt = select(Node).where(Node.organization_id == organization_id, Node.node_type.in_(["architecture", "decision", "adr"]))
        res = await session.execute(stmt)
        nodes = res.scalars().all()
        return {"content": [{"type": "text", "text": json.dumps([{"title": n.title, "summary": n.summary} for n in nodes], indent=2)}]}

    elif name == "answer_from_workspace":
        question = arguments.get("question", "")
        graph = GraphService(session)
        ctx_service = ContextService(session, graph)
        package = await ctx_service.generate_context_package(organization_id, "mcp", question)
        return {"content": [{"type": "text", "text": json.dumps(package.package_json, indent=2)}]}

    elif name == "get_project":
        project_name = arguments.get("project_name", "")
        stmt = select(Node).where(Node.organization_id == organization_id, Node.title.ilike(f"%{project_name}%"))
        res = await session.execute(stmt)
        nodes = res.scalars().all()
        return {"content": [{"type": "text", "text": json.dumps([{"id": str(n.id), "title": n.title, "summary": n.summary} for n in nodes], indent=2)}]}

    elif name == "resolve_entity":
        query = arguments.get("query", "")
        stmt = select(Node).where(Node.organization_id == organization_id, Node.title.ilike(f"%{query}%"))
        res = await session.execute(stmt)
        nodes = res.scalars().all()
        return {"content": [{"type": "text", "text": json.dumps([{"id": str(n.id), "title": n.title, "node_type": n.node_type} for n in nodes], indent=2)}]}

    elif name == "list_recent_changes":
        stmt = select(Node).where(Node.organization_id == organization_id).order_by(Node.updated_at.desc()).limit(10)
        res = await session.execute(stmt)
        nodes = res.scalars().all()
        return {"content": [{"type": "text", "text": json.dumps([{"title": n.title, "updated_at": str(n.updated_at)} for n in nodes], indent=2)}]}

    else:
        raise HTTPException(status_code=404, detail=f"Tool '{name}' not found.")


# ── Tenant-Isolated Prompts Resolvers ──────────────────────────────────────────
async def list_mcp_prompts() -> List[Dict[str, Any]]:
    return [
        {"name": "review_codebase", "description": "Review codebase architecture and design rules.", "arguments": [{"name": "repo_name", "description": "Repository name to review", "required": False}]},
        {"name": "prepare_meeting", "description": "Prepare customer/team meeting context and past decisions.", "arguments": [{"name": "topic", "description": "Meeting topic or participant name", "required": True}]},
        {"name": "explain_project", "description": "Explain active project goals, architecture, and status.", "arguments": [{"name": "project_name", "description": "Project name to explain", "required": True}]},
        {"name": "generate_summary", "description": "Generate summary of recent workspace decisions and commits.", "arguments": []}
    ]

async def get_mcp_prompt(name: str, arguments: Dict[str, Any], organization_id: uuid.UUID, session: AsyncSession) -> Dict[str, Any]:
    if name == "review_codebase":
        return {
            "description": "Codebase Architecture Review Template",
            "messages": [
                {"role": "user", "content": {"type": "text", "text": "Analyze the codebase architecture, design constraints, and data models for Metaphor OS."}}
            ]
        }
    elif name == "prepare_meeting":
        topic = arguments.get("topic", "")
        return {
            "description": f"Meeting Context Preparation for {topic}",
            "messages": [
                {"role": "user", "content": {"type": "text", "text": f"Gather past meeting notes, open decisions, and background context for '{topic}'."}}
            ]
        }
    elif name == "explain_project":
        proj = arguments.get("project_name", "")
        return {
            "description": f"Project Explanation for {proj}",
            "messages": [
                {"role": "user", "content": {"type": "text", "text": f"Provide an architectural overview, active sprint goals, and technical specs for '{proj}'."}}
            ]
        }
    elif name == "generate_summary":
        return {
            "description": "Workspace Activity Summary",
            "messages": [
                {"role": "user", "content": {"type": "text", "text": "Summarize recent commits, document updates, and architectural decisions."}}
            ]
        }
    else:
        raise HTTPException(status_code=404, detail=f"Prompt '{name}' not found.")
