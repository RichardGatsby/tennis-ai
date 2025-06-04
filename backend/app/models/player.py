"""Player model and related enums."""

from datetime import date
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Boolean, Date, Enum
from sqlalchemy.orm import relationship

from .base import BaseModel


class SkillLevel(PyEnum):
    """Player skill level enum."""

    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"


class PreferredHand(PyEnum):
    """Player preferred hand enum."""

    RIGHT = "RIGHT"
    LEFT = "LEFT"
    AMBIDEXTROUS = "AMBIDEXTROUS"


class Player(BaseModel):
    """Player model representing registered users."""

    __tablename__ = "players"

    # Authentication & Contact
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    # Personal Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    display_name = Column(String(200))
    phone = Column(String(20))
    date_of_birth = Column(Date)

    # Tennis-specific Attributes
    skill_level = Column(Enum(SkillLevel), default=SkillLevel.INTERMEDIATE, index=True)
    preferred_hand = Column(Enum(PreferredHand), default=PreferredHand.RIGHT)

    # Status
    is_active = Column(Boolean, default=True, index=True)

    # Relationships
    registrations = relationship("Registration", back_populates="player")
    organized_tournaments = relationship("Tournament", back_populates="organizer")
    player1_matches = relationship("Match", foreign_keys="Match.player1_id")
    player2_matches = relationship("Match", foreign_keys="Match.player2_id")
    won_matches = relationship("Match", foreign_keys="Match.winner_id")

    def __repr__(self) -> str:
        return f"<Player(id={self.id}, email={self.email}, name={self.first_name} {self.last_name})>"
