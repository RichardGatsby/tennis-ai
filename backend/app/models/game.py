"""Game model for detailed tennis scoring."""

from sqlalchemy import Column, String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from .base import BaseModel


class Game(BaseModel):
    """Game model for point-by-point tennis scoring within sets."""

    __tablename__ = "games"

    # Set Context
    set_id = Column(String, ForeignKey("sets.id"), nullable=False, index=True)
    game_number = Column(Integer, nullable=False)  # 1, 2, 3, etc.

    # Point Score (0=0, 1=15, 2=30, 3=40, 4=game)
    player1_points = Column(Integer, default=0)
    player2_points = Column(Integer, default=0)

    # Deuce and Advantage
    is_deuce = Column(Boolean, default=False)
    advantage_player_id = Column(String, ForeignKey("players.id"))

    # Game Result
    is_completed = Column(Boolean, default=False)
    winner_id = Column(String, ForeignKey("players.id"))

    # Service
    server_id = Column(String, ForeignKey("players.id"), nullable=False)

    # Relationships
    set = relationship("Set", back_populates="games")
    winner = relationship("Player", foreign_keys=[winner_id])
    server = relationship("Player", foreign_keys=[server_id])
    advantage_player = relationship("Player", foreign_keys=[advantage_player_id])

    def __repr__(self) -> str:
        return f"<Game(id={self.id}, set_id={self.set_id}, game_number={self.game_number}, score={self.player1_points}-{self.player2_points})>"
