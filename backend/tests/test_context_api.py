import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

from app.models import Node, Chunk
from app.routes.context import query_context, ContextQueryRequest

@pytest.mark.asyncio
@patch("app.routes.context.llm_provider")
async def test_context_query(mock_llm_provider):
    mock_llm_provider.query_claude = AsyncMock(
        return_value="Metaphor is the Context Operating System."
    )

    mock_session = AsyncMock()

    # Mock matching nodes
    mock_nodes_result = MagicMock()
    mock_nodes_result.all.return_value = [
        Node(id=uuid.uuid4(), name="Metaphor Engine", type="Project", metadata_json={"desc": "Context OS"})
    ]

    # Mock matching chunks
    mock_chunks_result = MagicMock()
    mock_chunks_result.all.return_value = [
        Chunk(id=uuid.uuid4(), text_content="Metaphor powers Atlas and William context.", metadata_json={})
    ]

    mock_session.exec = AsyncMock(side_effect=[mock_nodes_result, mock_chunks_result])

    req = ContextQueryRequest(query="Metaphor", consumer="William")
    response = await query_context(req=req, session=mock_session, api_key="mock_key")

    assert response.query == "Metaphor"
    assert len(response.relevant_nodes) == 1
    assert response.relevant_nodes[0]["name"] == "Metaphor Engine"
    assert len(response.relevant_chunks) == 1
    assert "Metaphor powers" in response.relevant_chunks[0]["content"]
    assert response.synthesized_answer == "Metaphor is the Context Operating System."
