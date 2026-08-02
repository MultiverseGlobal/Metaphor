import json
import uuid
import logging
from typing import Dict, Any, List
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from app.models.context import ContextSession, ContextPackage
from app.models.graph import Node
from app.services.graph import GraphService
from datetime import datetime

logger = logging.getLogger("metaphor.services.context")

class ContextService:
    def __init__(self, session: AsyncSession, graph_service: GraphService):
        self.session = session
        self.graph = graph_service

    async def get_or_create_session(self, org_id: uuid.UUID, ai_consumer: str, objective: str) -> ContextSession:
        """Finds an active context session for this consumer/objective, or creates one."""
        stmt = select(ContextSession).where(
            ContextSession.organization_id == org_id,
            ContextSession.ai_consumer == ai_consumer,
            ContextSession.objective == objective
        )
        result = await self.session.execute(stmt)
        ctx_session = result.scalar_one_or_none()
        
        if not ctx_session:
            ctx_session = ContextSession(
                organization_id=org_id,
                ai_consumer=ai_consumer,
                objective=objective,
                state={"previously_sent_node_ids": []}
            )
            self.session.add(ctx_session)
            await self.session.commit()
            await self.session.refresh(ctx_session)
            
        return ctx_session

    async def generate_context_package(self, org_id: uuid.UUID, ai_consumer: str, query: str) -> ContextPackage:
        """
        Generates a Context Package. If a Context Session exists, it only sends a delta of new nodes.
        """
        # 1. Resolve Session
        ctx_session = await self.get_or_create_session(org_id, ai_consumer, query)
        
        # 2. Search for relevant nodes via Vector Search
        from app.services.llm import llm_service
        query_embedding = await llm_service.generate_embedding(query)
        nodes = await self.graph.vector_search(org_id, query_embedding, limit=20)
        
        # 3. Filter out nodes we already sent in this session to reduce token bloat
        previously_sent = set(ctx_session.state.get("previously_sent_node_ids", []))
        
        new_nodes = []
        for node in nodes:
            node_id_str = str(node.id)
            if node_id_str not in previously_sent:
                new_nodes.append(node)
                previously_sent.add(node_id_str)
                
        # 4. Update session state
        ctx_session.state["previously_sent_node_ids"] = list(previously_sent)
        ctx_session.last_active_at = datetime.utcnow()
        self.session.add(ctx_session)
        
        # 5. Build rich, semantic Context Pack JSON payload
        node_summaries = [
            {
                "id": str(n.id),
                "type": n.type,
                "title": n.title,
                "summary": n.summary,
                "source": getattr(n, "source", "workspace")
            }
            for n in new_nodes
        ]

        if not nodes:
            status = "no_results"
            answer_text = "I searched your Metaphor workspace, but found no indexed nodes matching your query."
        else:
            status = "matched"
            answer_text = f"Found {len(new_nodes)} relevant context items in your workspace memory."

        package_json = {
            "status": status,
            "query": query,
            "answer": answer_text,
            "workspace_summary": {
                "total_items_found": len(nodes),
                "new_items_in_context": len(new_nodes),
                "categories": list(set(n.type for n in nodes))
            },
            "evidence": node_summaries,
            "confidence": 0.95 if nodes else 0.0
        }

        
        # 6. Save the package history
        pkg = ContextPackage(
            objective=query,
            package_json=package_json,
            token_count=len(json.dumps(package_json)) # Rough token estimation
        )
        self.session.add(pkg)
        await self.session.commit()
        await self.session.refresh(pkg)
        
        return pkg
