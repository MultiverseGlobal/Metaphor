import pytest
import uuid
import json
from unittest.mock import patch, AsyncMock
from sqlmodel import Session
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.reflection import ReflectionService
from app.services.graph import GraphService
from app.models.operations import WebhookEvent

@pytest.mark.asyncio
async def test_reflection_supersede_operation():
    # Setup mock session and services
    # We will just mock GraphService methods to avoid needing a full DB setup for this isolated unit test
    mock_graph = AsyncMock(spec=GraphService)
    
    # Mock existing node
    old_node_id = uuid.uuid4()
    mock_graph.list_recent_nodes.return_value = []
    
    # Mock LLM response to simulate a SUPERSEDE operation
    mock_llm_response = """
    ```json
    {
      "operations": [
        {
          "action": "SUPERSEDE_NODE",
          "old_node_id": "OLD_NODE_ID_PLACEHOLDER",
          "new_node": {
            "title": "Flat $500 Pricing",
            "type": "Decision",
            "summary": "Switched to flat pricing.",
            "metadata": {}
          }
        }
      ],
      "evidence_links": []
    }
    ```
    """.replace("OLD_NODE_ID_PLACEHOLDER", str(old_node_id))
    
    # Setup the event
    event = WebhookEvent(
        provider="notion",
        event_type="page_updated",
        payload={"url": "https://notion.so/pricing", "content": "Benjamin decided to switch to flat $500 pricing to simplify billing."}
    )
    
    with patch("app.services.reflection.llm_service.query_llm", new_callable=AsyncMock) as mock_query_llm:
        mock_query_llm.return_value = mock_llm_response
        
        service = ReflectionService(mock_graph)
        org_id = uuid.uuid4()
        
        # Mock create_node to return a node with a new ID
        new_node_id = uuid.uuid4()
        class MockNode:
            def __init__(self, id):
                self.id = id
        mock_graph.create_node.return_value = MockNode(new_node_id)
        
        # Run reflection
        result = await service.reflect_and_evolve(org_id, event)
        
        assert result["status"] == "success"
        assert result["operations_applied"] == 1
        
        # Verify graph mutations were called
        # 1. create new node
        mock_graph.create_node.assert_called_once()
        
        # 2. update old node to superseded
        mock_graph.update_node.assert_called_once_with(old_node_id, status="superseded", superseded_by_id=new_node_id)
        
        # 3. create explicit edge
        mock_graph.create_edge.assert_called_once_with(from_node=new_node_id, to_node=old_node_id, relationship="supersedes")
