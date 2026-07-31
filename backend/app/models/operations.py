import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, DateTime, JSON

class Integration(SQLModel, table=True):
    __tablename__ = "integrations"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    organization_id: uuid.UUID = Field(foreign_key="organizations.id", index=True)
    
    provider: str # e.g., "notion", "github"
    status: str = Field(default="active")
    
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True)))
    
    settings: dict = Field(default_factory=dict, sa_column=Column(JSON))

class WebhookEvent(SQLModel, table=True):
    __tablename__ = "events"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    provider: str
    event_type: str
    
    payload: dict = Field(default_factory=dict, sa_column=Column(JSON))
    
    received_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))
    processed_at: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True)))

class Activity(SQLModel, table=True):
    __tablename__ = "activity"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id", index=True)
    
    action: str
    entity: str
    entity_id: str
    
    timestamp: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))

class APIKey(SQLModel, table=True):
    __tablename__ = "api_keys"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    organization_id: uuid.UUID = Field(foreign_key="organizations.id", index=True)
    
    name: str
    hashed_key: str
    last_used: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True)))
    permissions: dict = Field(default_factory=dict, sa_column=Column(JSON))

class MCPSession(SQLModel, table=True):
    __tablename__ = "mcp_sessions"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    organization_id: uuid.UUID = Field(foreign_key="organizations.id", index=True)
    
    client: str
    
    connected_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))
    last_seen: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))
