"""Match model for individual tournament matches."""

from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship

from .base import BaseModel


class MatchStatus(PyEnum):
    """Match status enum."""

    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FORFEIT = "FORFEIT"
    CANCELLED = "CANCELLED"


class MatchRound(PyEnum):
    """Match round enum for different tournament formats."""

    # Round Robin
    ROUND_ROBIN = "ROUND_ROBIN"

    # Single Elimination Rounds
    ROUND_32 = "ROUND_32"
    ROUND_16 = "ROUND_16"
    QUARTER_FINAL = "QUARTER_FINAL"
    SEMI_FINAL = "SEMI_FINAL"
    FINAL = "FINAL"

    # Double Elimination
    WINNERS_BRACKET = "WINNERS_BRACKET"
    LOSERS_BRACKET = "LOSERS_BRACKET"
    GRAND_FINAL = "GRAND_FINAL"


class Match(BaseModel):
    """Match model representing individual matches within tournaments."""

    __tablename__ = "matches"

    # Tournament Context
    tournament_id = Column(
        String, ForeignKey("tournaments.id"), nullable=False, index=True
    )
    round = Column(Enum(MatchRound), nullable=False, index=True)
    match_number = Column(Integer)  # Sequence within round

    # Participants
    player1_id = Column(String, ForeignKey("players.id"), nullable=False, index=True)
    player2_id = Column(
        String, ForeignKey("players.id"), index=True
    )  # Nullable for byes

    # Match Status and Timing
    status = Column(Enum(MatchStatus), default=MatchStatus.SCHEDULED, index=True)
    scheduled_at = Column(DateTime(timezone=True), index=True)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))

    # Results
    winner_id = Column(String, ForeignKey("players.id"), index=True)
    forfeit_by = Column(String, ForeignKey("players.id"))  # Player who forfeited

    # Match Configuration
    best_of_sets = Column(Integer, default=3)

    # Court Assignment
    court_number = Column(String(20))

    # Relationships
    tournament = relationship("Tournament", back_populates="matches")
    player1 = relationship(
        "Player", foreign_keys=[player1_id], overlaps="player1_matches"
    )
    player2 = relationship(
        "Player", foreign_keys=[player2_id], overlaps="player2_matches"
    )
    winner = relationship("Player", foreign_keys=[winner_id], overlaps="won_matches")
    forfeit_player = relationship("Player", foreign_keys=[forfeit_by])
    sets = relationship("Set", back_populates="match", order_by="Set.set_number")

    def __repr__(self) -> str:
        return f"<Match(id={self.id}, tournament_id={self.tournament_id}, round={self.round.value}, status={self.status.value})>"
