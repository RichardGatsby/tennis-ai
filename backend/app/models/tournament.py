"""Tournament model and related enums."""

from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    Boolean,
    Enum,
    Text,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from .base import BaseModel


class TournamentFormat(PyEnum):
    """Tournament format enum."""

    ROUND_ROBIN = "ROUND_ROBIN"
    SINGLE_ELIMINATION = "SINGLE_ELIMINATION"
    DOUBLE_ELIMINATION = "DOUBLE_ELIMINATION"


class TournamentStatus(PyEnum):
    """Tournament status enum."""

    DRAFT = "DRAFT"
    REGISTRATION_OPEN = "REGISTRATION_OPEN"
    REGISTRATION_CLOSED = "REGISTRATION_CLOSED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Tournament(BaseModel):
    """Tournament model representing tennis tournaments."""

    __tablename__ = "tournaments"

    # Basic Information
    name = Column(String(200), nullable=False)
    description = Column(Text)

    # Tournament Configuration
    format = Column(Enum(TournamentFormat), nullable=False, index=True)
    max_participants = Column(Integer, default=32)
    entry_fee = Column(Integer, default=0)  # in cents
    prize_pool = Column(Integer, default=0)  # in cents

    # Scheduling
    registration_deadline = Column(DateTime(timezone=True))
    start_date = Column(DateTime(timezone=True), index=True)
    end_date = Column(DateTime(timezone=True))

    # Location
    venue_name = Column(String(200))
    venue_address = Column(Text)

    # Match Rules
    best_of_sets = Column(Integer, default=3)  # Best of 3 or 5 sets
    tiebreak_games = Column(Integer, default=6)  # Games before tiebreak
    match_duration_limit = Column(Integer)  # Minutes, null = no limit

    # Status and Access
    status = Column(Enum(TournamentStatus), default=TournamentStatus.DRAFT, index=True)
    is_public = Column(Boolean, default=True, index=True)
    allow_registration = Column(Boolean, default=True)

    # Organizer
    organizer_id = Column(String, ForeignKey("players.id"), nullable=False, index=True)

    # Relationships
    organizer = relationship("Player", back_populates="organized_tournaments")
    registrations = relationship("Registration", back_populates="tournament")
    matches = relationship("Match", back_populates="tournament")

    def __repr__(self) -> str:
        return (
            f"<Tournament(id={self.id}, name={self.name}, format={self.format.value})>"
        )
