"""Base model with common fields for all entities."""

from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class BaseModel(Base):
    """Base model class with common fields for all entities."""

    __abstract__ = True

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
