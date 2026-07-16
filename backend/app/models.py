import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlmodel import SQLModel, Field, Relationship, JSON, Column
from sqlalchemy import Text
from pgvector.sqlalchemy import Vector

# Association table for Node to Chunk evidence
class NodeEvidence(SQLModel, table=True):
    node_id: uuid.UUID = Field(foreign_key="node.id", primary_key=True)
    chunk_id: uuid.UUID = Field(foreign_key="chunk.id", primary_key=True)

class Node(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)
    type: str = Field(index=True)  # e.g., "Person", "Meeting", "Idea", "Decision", "Commit", "Project"
    metadata_json: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    incoming_edges: List["Edge"] = Relationship(
        sa_relationship_kwargs={"primaryjoin": "Node.id==Edge.target_id"}
    )
    outgoing_edges: List["Edge"] = Relationship(
        sa_relationship_kwargs={"primaryjoin": "Node.id==Edge.source_id"}
    )
    chunks: List["Chunk"] = Relationship(
        link_model=NodeEvidence, back_populates="nodes"
    )

class Edge(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    source_id: uuid.UUID = Field(foreign_key="node.id", index=True)
    target_id: uuid.UUID = Field(foreign_key="node.id", index=True)
    dimension: str = Field(index=True)  # "structural", "semantic", "temporal"
    relationship_type: str = Field(index=True)  # e.g., "contains", "caused_by", "evidence_for", "decided_in"
    weight: float = Field(default=1.0)
    metadata_json: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON)) # E.g., {"explanation": "..."}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Chunk(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    text_content: str = Field(sa_column=Column(Text, nullable=False))
    # 1536 dimensions for OpenAI text-embedding-3-small/text-embedding-ada-002
    embedding: Optional[List[float]] = Field(default=None, sa_column=Column(Vector(1536), nullable=True))
    metadata_json: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    nodes: List[Node] = Relationship(
        link_model=NodeEvidence, back_populates="chunks"
    )
