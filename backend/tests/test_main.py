import pytest
import uuid
from sqlmodel import SQLModel, create_engine, select
from sqlmodel.pool import StaticPool
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.models import Node, Edge, Chunk
from app.reflection import reflection_engine

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
