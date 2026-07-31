from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from app.database.session import get_session
from app.services.identity import IdentityService
from app.models.graph import Node, Edge
from app.models.operations import WebhookEvent
from app.models.context import ContextSession

router = APIRouter()

@router.get("/")
async def get_graph(db: AsyncSession = Depends(get_session)):
    """Retrieve all nodes and edges for the active organization."""
    identity = IdentityService(db)
    org = await identity.get_or_create_default_organization()

    # Get nodes
    nodes_res = await db.execute(select(Node).where(Node.organization_id == org.id))
    nodes = nodes_res.scalars().all()

    # Get edges
    edges_res = await db.execute(select(Edge).where(Edge.organization_id == org.id))
    edges = edges_res.scalars().all()

    return {
        "nodes": [
            {"id": str(n.id), "name": n.title, "type": n.type, "summary": n.summary}
            for n in nodes
        ],
        "edges": [
            {"id": str(e.id), "source": str(e.from_node_id), "target": str(e.to_node_id), "type": e.relationship}
            for e in edges
        ]
    }

@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_session)):
    """Retrieve high-level metrics for the dashboard."""
    identity = IdentityService(db)
    org = await identity.get_or_create_default_organization()

    node_count = (await db.execute(select(func.count(Node.id)).where(Node.organization_id == org.id))).scalar()
    edge_count = (await db.execute(select(func.count(Edge.id)).where(Edge.organization_id == org.id))).scalar()
    session_count = (await db.execute(select(func.count(ContextSession.id)).where(ContextSession.organization_id == org.id))).scalar()
    event_count = (await db.execute(select(func.count(WebhookEvent.id)))).scalar()

    return {
        "node_count": node_count or 0,
        "edge_count": edge_count or 0,
        "active_sessions": session_count or 0,
        "total_events": event_count or 0
    }
