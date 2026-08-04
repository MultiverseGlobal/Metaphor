import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from app.database.session import get_session
from app.services.identity import IdentityService
from app.models.graph import Node, Edge
from app.models.operations import WebhookEvent
from app.models.context import ContextSession

from app.core.security import get_user_via_api_key
from app.models.identity import User, Organization, OrganizationMember

router = APIRouter()

async def get_user_org(user: User, db: AsyncSession) -> Organization:
    stmt = select(OrganizationMember).where(OrganizationMember.user_id == user.id)
    res = await db.execute(stmt)
    org_member = res.scalars().first()
    if org_member:
        org = await db.get(Organization, org_member.organization_id)
        if org:
            return org
    identity = IdentityService(db)
    return await identity.get_or_create_default_organization()

@router.get("/")
async def get_graph(
    user: User = Depends(get_user_via_api_key),
    db: AsyncSession = Depends(get_session)
):
    """Retrieve all nodes and edges for the authenticated user's organization."""
    org = await get_user_org(user, db)

    # Get nodes
    nodes_res = await db.execute(select(Node).where(Node.organization_id == org.id))
    nodes = nodes_res.scalars().all()

    # Get edges
    edges_res = await db.execute(
        select(Edge).join(Node, Edge.from_node == Node.id).where(Node.organization_id == org.id)
    )
    edges = edges_res.scalars().all()

    if not nodes:
        node1 = Node(
            id=uuid.uuid4(),
            organization_id=org.id,
            type="architecture",
            title="Metaphor OS Architecture",
            summary="Core Cognitive Operating System memory layer with Graph RAG.",
            raw_data={"status": "active"}
        )
        node2 = Node(
            id=uuid.uuid4(),
            organization_id=org.id,
            type="project",
            title="Remote MCP Integration",
            summary="OAuth 2.1 PKCE server connecting ChatGPT and Claude Desktop.",
            raw_data={"status": "connected"}
        )
        node3 = Node(
            id=uuid.uuid4(),
            organization_id=org.id,
            type="rule",
            title="Linear Design System Enforcer",
            summary="UI/UX rule enforcement with semantic design tokens and 8pt baselines.",
            raw_data={"priority": "high"}
        )
        db.add_all([node1, node2, node3])
        await db.flush()

        edge1 = Edge(id=uuid.uuid4(), from_node=node1.id, to_node=node2.id, relationship="ENABLES")
        edge2 = Edge(id=uuid.uuid4(), from_node=node1.id, to_node=node3.id, relationship="ENFORCES")
        db.add_all([edge1, edge2])
        await db.commit()

        nodes = [node1, node2, node3]
        edges = [edge1, edge2]


    return {
        "nodes": [
            {"id": str(n.id), "name": n.title, "type": n.type, "summary": n.summary}
            for n in nodes
        ],
        "edges": [
            {"id": str(e.id), "source": str(e.from_node), "target": str(e.to_node), "type": e.relationship}
            for e in edges
        ]
    }


@router.get("/stats")
async def get_stats(
    user: User = Depends(get_user_via_api_key),
    db: AsyncSession = Depends(get_session)
):
    """Retrieve high-level metrics for the dashboard for the authenticated user."""
    org = await get_user_org(user, db)

    node_count = (await db.execute(select(func.count(Node.id)).where(Node.organization_id == org.id))).scalar()
    edge_count = (await db.execute(select(func.count(Edge.id)).join(Node, Edge.from_node == Node.id).where(Node.organization_id == org.id))).scalar()
    session_count = (await db.execute(select(func.count(ContextSession.id)).where(ContextSession.organization_id == org.id))).scalar()
    event_count = (await db.execute(select(func.count(WebhookEvent.id)))).scalar()

    return {
        "node_count": node_count or 0,
        "edge_count": edge_count or 0,
        "active_sessions": session_count or 0,
        "total_events": event_count or 0
    }

@router.get("/inbox")
async def get_inbox(
    user: User = Depends(get_user_via_api_key),
    db: AsyncSession = Depends(get_session)
):
    """Retrieve all pending nodes for review for the authenticated user's organization."""
    org = await get_user_org(user, db)

    nodes_res = await db.execute(
        select(Node).where(Node.organization_id == org.id, Node.status == "pending_review")
    )
    nodes = nodes_res.scalars().all()

    return {
        "nodes": [
            {"id": str(n.id), "title": n.title, "type": n.type, "summary": n.summary, "content": n.content, "confidence": n.confidence, "created_at": n.created_at}
            for n in nodes
        ]
    }

@router.post("/nodes/{node_id}/approve")
async def approve_node(
    node_id: uuid.UUID,
    user: User = Depends(get_user_via_api_key),
    db: AsyncSession = Depends(get_session)
):
    """Approve a pending node."""
    org = await get_user_org(user, db)
    node = await db.get(Node, node_id)
    if not node or node.organization_id != org.id:
        raise HTTPException(status_code=404, detail="Node not found")
    node.status = "approved"
    db.add(node)
    await db.commit()
    return {"status": "success"}

@router.post("/nodes/{node_id}/reject")
async def reject_node(
    node_id: uuid.UUID,
    user: User = Depends(get_user_via_api_key),
    db: AsyncSession = Depends(get_session)
):
    """Reject a pending node."""
    org = await get_user_org(user, db)
    node = await db.get(Node, node_id)
    if not node or node.organization_id != org.id:
        raise HTTPException(status_code=404, detail="Node not found")
    node.status = "rejected"
    db.add(node)
    await db.commit()
    return {"status": "success"}


# ── The Binding Phase: Project Node CRUD ────────────────────────────────────

class CreateNodeRequest(BaseModel):
    type: str
    title: str
    summary: Optional[str] = ""
    content: Optional[str] = ""
    metadata: Optional[dict] = {}


@router.post("/nodes")
async def create_node(
    req: CreateNodeRequest,
    user: User = Depends(get_user_via_api_key),
    db: AsyncSession = Depends(get_session)
):
    """
    Create a new node directly — used during The Binding Phase of onboarding
    to register user-defined projects into the Knowledge Graph.
    """
    org = await get_user_org(user, db)
    node = Node(
        id=uuid.uuid4(),
        organization_id=org.id,
        type=req.type,
        title=req.title,
        summary=req.summary or "",
        content=req.content or "",
        created_by=user.id,
        status="approved",
    )
    db.add(node)
    await db.commit()
    await db.refresh(node)
    return {
        "id": str(node.id),
        "type": node.type,
        "title": node.title,
        "summary": node.summary,
        "created_at": node.created_at.isoformat()
    }


@router.get("/nodes")
async def list_nodes(
    type: Optional[str] = Query(None, description="Filter nodes by type, e.g. 'project'"),
    user: User = Depends(get_user_via_api_key),
    db: AsyncSession = Depends(get_session)
):
    """
    List all nodes for the user's organization, optionally filtered by type.
    Used by /dashboard/projects to display user-created projects.
    """
    org = await get_user_org(user, db)
    stmt = select(Node).where(Node.organization_id == org.id)
    if type:
        stmt = stmt.where(Node.type == type)
    res = await db.execute(stmt)
    nodes = res.scalars().all()
    return {
        "nodes": [
            {
                "id": str(n.id),
                "type": n.type,
                "title": n.title,
                "summary": n.summary,
                "status": n.status,
                "created_at": n.created_at.isoformat()
            }
            for n in nodes
        ]
    }
