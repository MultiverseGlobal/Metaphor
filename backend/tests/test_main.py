import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock, patch
from sqlmodel import SQLModel, create_engine, select
from sqlmodel.pool import StaticPool
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.models import Node, Edge, Chunk
from app.reflection import reflection_engine
from app.routes.context import get_context_snapshot, SnapshotRequest

# Use in-memory SQLite for testing if desired, or test mock extraction output
@pytest.mark.asyncio
async def test_mock_reflection_schema():
    # Verify that mock reflection populates the expected node types and structure
    mock_logs = [
        {"id": "notion_mock_page_1", "title": "Atlas: Ideal Customer Profile (ICP)", "content": "Sample content", "source": "notion", "metadata": {}},
        {"id": "github_commit_mock_1", "title": "GitHub Commit", "content": "Sample commit content", "source": "github", "metadata": {}}
    ]
    
    result = reflection_engine._get_mock_reflection_results(mock_logs)
    
    assert "nodes_to_create" in result
    assert "edges_to_create" in result
    
    # We should have nodes representing Projects, Persons, Decisions, and Commits
    node_types = {n["type"] for n in result["nodes_to_create"]}
    assert "Project" in node_types
    assert "Person" in node_types
    assert "Decision" in node_types
    
    # We should have Structural, Semantic, and Temporal edges
    edge_dims = {e["dimension"] for e in result["edges_to_create"]}
    assert "structural" in edge_dims
    assert "semantic" in edge_dims
    assert "temporal" in edge_dims


@pytest.mark.asyncio
@patch("app.routes.context.llm_provider")
async def test_context_snapshot(mock_llm_provider):
    mock_llm_provider.query_claude = AsyncMock(
        return_value='{"mission": "Mocked Mission", "constraints": ["Constraint 1"], "recommended_focus": "Mocked Focus"}'
    )
    # Mock database session
    mock_session = AsyncMock()
    
    # Mock result from select(Node)
    mock_nodes_result = MagicMock()
    mock_nodes_result.all.return_value = [
        Node(id=uuid.uuid4(), name="Atlas", type="Project"),
        Node(id=uuid.uuid4(), name="Renamed Tier Pricing", type="Decision"),
    ]
    
    # Mock result from select(Edge)
    mock_edges_result = MagicMock()
    mock_edges_result.all.return_value = []
    
    # Mock session.exec
    mock_session.exec.side_effect = [mock_nodes_result, mock_edges_result]
    
    # Call the endpoint handler directly
    req = SnapshotRequest(consumer="William", intent="morning_brief")
    response = await get_context_snapshot(req=req, session=mock_session, api_key="mock_key")
    
    assert response.mission == "Mocked Mission"
    assert response.recommended_focus == "Mocked Focus"
    assert len(response.active_projects) == 1
    assert response.active_projects[0]["name"] == "Atlas"
    assert len(response.recent_decisions) == 1
    assert response.recent_decisions[0]["name"] == "Renamed Tier Pricing"
    assert len(response.constraints) == 1
    assert response.constraints[0] == "Constraint 1"
