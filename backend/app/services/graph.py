import uuid
from typing import List, Optional, Dict
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from app.models.graph import Node, NodeMetadata, Edge, Evidence
from datetime import datetime

class GraphService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_node(self, org_id: uuid.UUID, type: str, title: str, summary: str, content: str, metadata: Dict[str, str] = None, embedding_vector: List[float] = None, confidence: float = 1.0, source_event_id: Optional[uuid.UUID] = None) -> Node:
        # Idempotency check
        if source_event_id:
            stmt = select(Node).where(
                Node.organization_id == org_id,
                Node.source_event_id == source_event_id,
                Node.title == title[:255]
            )
            res = await self.session.execute(stmt)
            existing = res.scalars().first()
            if existing:
                return existing

        node = Node(
            organization_id=org_id,
            type=type,
            title=title[:255],
            summary=summary,
            content=content,
            confidence=confidence,
            source_event_id=source_event_id
        )
        self.session.add(node)
        await self.session.commit()
        await self.session.refresh(node)
        
        if embedding_vector:
            from app.models.graph import Embedding
            emb = Embedding(node_id=node.id, vector=embedding_vector)
            self.session.add(emb)
            await self.session.commit()
            await self.session.refresh(emb)
            node.embedding_id = emb.id
            self.session.add(node)
            await self.session.commit()
            
        if metadata:
            for k, v in metadata.items():
                md = NodeMetadata(node_id=node.id, key=k, value=str(v))
                self.session.add(md)
            await self.session.commit()
            
        return node

    async def vector_search(self, org_id: uuid.UUID, query_vector: List[float], limit: int = 20) -> List[Node]:
        from app.models.graph import Embedding
        stmt = (
            select(Node)
            .join(Embedding, Node.embedding_id == Embedding.id)
            .where(Node.organization_id == org_id)
            .where(Node.status == "active")
            .order_by(Embedding.vector.cosine_distance(query_vector))
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def add_evidence(self, node_id: uuid.UUID, source: str, source_type: str, raw_text: str, url: str = None) -> Evidence:
        import hashlib
        checksum = hashlib.sha256(raw_text.encode('utf-8')).hexdigest()
        
        evidence = Evidence(
            node_id=node_id,
            source=source,
            source_type=source_type,
            url=url,
            raw_text=raw_text,
            checksum=checksum
        )
        self.session.add(evidence)
        await self.session.commit()
        await self.session.refresh(evidence)
        return evidence

    async def create_edge(self, from_node: uuid.UUID, to_node: uuid.UUID, relationship: str, weight: float = 1.0, source_event_id: Optional[uuid.UUID] = None) -> Edge:
        # Idempotency check
        if source_event_id:
            stmt = select(Edge).where(
                Edge.from_node == from_node,
                Edge.to_node == to_node,
                Edge.relationship == relationship,
                Edge.source_event_id == source_event_id
            )
            res = await self.session.execute(stmt)
            existing = res.scalars().first()
            if existing:
                return existing

        edge = Edge(
            from_node=from_node,
            to_node=to_node,
            relationship=relationship,
            weight=weight,
            source_event_id=source_event_id
        )
        self.session.add(edge)
        await self.session.commit()
        await self.session.refresh(edge)
        return edge

    async def get_node(self, node_id: uuid.UUID) -> Optional[Node]:
        return await self.session.get(Node, node_id)
        
    async def update_node(self, node_id: uuid.UUID, **kwargs) -> Optional[Node]:
        node = await self.get_node(node_id)
        if not node:
            return None
        for key, value in kwargs.items():
            if hasattr(node, key):
                setattr(node, key, value)
        node.updated_at = datetime.utcnow()
        self.session.add(node)
        await self.session.commit()
        await self.session.refresh(node)
        return node
        
    async def list_recent_nodes(self, org_id: uuid.UUID, limit: int = 50) -> List[Node]:
        stmt = select(Node).where(Node.organization_id == org_id).order_by(Node.created_at.desc()).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()
