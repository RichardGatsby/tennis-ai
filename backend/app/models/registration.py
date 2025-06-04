"""Registration model for tournament enrollment."""

from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import (
    Column,
    String,
    DateTime,
    Boolean,
    Enum,
    ForeignKey,
    UniqueConstraint,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from .base import BaseModel


class RegistrationStatus(PyEnum):
    """Registration status enum."""

    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    WAITLISTED = "WAITLISTED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"


class Registration(BaseModel):
    """Registration model linking players to tournaments."""

    __tablename__ = "registrations"

    # Foreign Keys
    player_id = Column(String, ForeignKey("players.id"), nullable=False, index=True)
    tournament_id = Column(
        String, ForeignKey("tournaments.id"), nullable=False, index=True
    )

    # Registration Workflow
    status = Column(
        Enum(RegistrationStatus), default=RegistrationStatus.PENDING, index=True
    )
    registration_date = Column(DateTime(timezone=True), server_default=func.now())
    confirmation_date = Column(DateTime(timezone=True))

    # Payment Tracking
    payment_status = Column(String(50), default="pending")  # pending, paid, refunded
    payment_reference = Column(String(100))

    # Additional Information
    notes = Column(Text)

    # Relationships
    player = relationship("Player", back_populates="registrations")
    tournament = relationship("Tournament", back_populates="registrations")

    # Constraints
    __table_args__ = (
        UniqueConstraint("player_id", "tournament_id", name="unique_player_tournament"),
    )

    def __repr__(self) -> str:
        return f"<Registration(id={self.id}, player_id={self.player_id}, tournament_id={self.tournament_id}, status={self.status.value})>"
