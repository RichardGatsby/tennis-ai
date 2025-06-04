"""Set model for tennis set scoring."""

from sqlalchemy import Column, String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from .base import BaseModel


class Set(BaseModel):
    """Set model representing tennis sets within matches."""

    __tablename__ = "sets"

    # Match Context
    match_id = Column(String, ForeignKey("matches.id"), nullable=False, index=True)
    set_number = Column(Integer, nullable=False)  # 1, 2, 3, etc.

    # Game Score
    player1_games = Column(Integer, default=0)
    player2_games = Column(Integer, default=0)

    # Tiebreak Scoring
    is_tiebreak = Column(Boolean, default=False)
    player1_tiebreak_points = Column(Integer, default=0)
    player2_tiebreak_points = Column(Integer, default=0)

    # Set Status
    is_completed = Column(Boolean, default=False, index=True)
    winner_id = Column(String, ForeignKey("players.id"))

    # Relationships
    match = relationship("Match", back_populates="sets")
    winner = relationship("Player")
    games = relationship("Game", back_populates="set", order_by="Game.game_number")

    def __repr__(self) -> str:
        return f"<Set(id={self.id}, match_id={self.match_id}, set_number={self.set_number}, score={self.player1_games}-{self.player2_games})>"
