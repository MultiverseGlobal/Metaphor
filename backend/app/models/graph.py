import uuid
from datetime import datetime
from typing import Optional, Any
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, DateTime, String, JSON
from pgvector.sqlalchemy import Vector

class Node(SQLModel, table=True):
    __tablename__ = "nodes"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    organization_id: uuid.UUID = Field(foreign_key="organizations.id", index=True)
    
    type: str = Field(index=True) # e.g., "decision", "goal", "constraint", "project"
    title: str
    summary: str
    content: str
    
    confidence: float = Field(default=1.0)
    status: str = Field(default="active")
    
    created_by: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))
    archived_at: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True)))
    
    # We maintain a reference to an embedding if it exists
    embedding_id: Optional[uuid.UUID] = Field(default=None, foreign_key="embeddings.id")

class NodeMetadata(SQLModel, table=True):
    __tablename__ = "node_metadata"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    node_id: uuid.UUID = Field(foreign_key="nodes.id", index=True)
    key: str = Field(index=True)
    value: str

class Edge(SQLModel, table=True):
    __tablename__ = "edges"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    from_node: uuid.UUID = Field(foreign_key="nodes.id", index=True)
    to_node: uuid.UUID = Field(foreign_key="nodes.id", index=True)
    
    relationship: str = Field(index=True) # e.g., "owns", "requires", "contradicts"
    weight: float = Field(default=1.0)
    
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))

class Evidence(SQLModel, table=True):
    __tablename__ = "evidence"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    node_id: uuid.UUID = Field(foreign_key="nodes.id", index=True)
    
    source: str # e.g., "notion", "github"
    source_type: str # e.g., "page", "commit"
    url: Optional[str] = None
    raw_text: str
    checksum: str
    
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))

class Embedding(SQLModel, table=True):
    __tablename__ = "embeddings"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    node_id: uuid.UUID = Field(foreign_key="nodes.id", index=True)
    
    vector: Any = Field(sa_column=Column(Vector(768))) # Assuming Gemini text-embedding-004
    model: str = Field(default="models/text-embedding-004")
    dimensions: int = Field(default=768)

class SearchDocument(SQLModel, table=True):
    __tablename__ = "search_documents"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    node_id: uuid.UUID = Field(foreign_key="nodes.id", index=True)
    
    title: str
    body: str
    keywords: str # Comma-separated or full text search vector in DB
    
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))
