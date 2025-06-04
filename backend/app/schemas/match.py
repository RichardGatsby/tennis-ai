"""Match schemas for request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.models.match import MatchStatus, MatchRound


class MatchBase(BaseModel):
    """Base match schema."""

    tournament_id: str
    round: MatchRound
    match_number: Optional[int] = None
    player1_id: str
    player2_id: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    best_of_sets: int = 3
    court_number: Optional[str] = None


class MatchCreate(MatchBase):
    """Schema for creating a match."""

    pass


class MatchUpdate(BaseModel):
    """Schema for updating a match."""

    round: Optional[MatchRound] = None
    match_number: Optional[int] = None
    player2_id: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[MatchStatus] = None
    best_of_sets: Optional[int] = None
    court_number: Optional[str] = None
    winner_id: Optional[str] = None


class MatchResponse(MatchBase):
    """Schema for match response."""

    id: str
    status: MatchStatus
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    winner_id: Optional[str] = None
    forfeit_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MatchStatusUpdate(BaseModel):
    """Schema for updating match status."""

    action: str  # "start", "complete", "forfeit"
    winner_id: Optional[str] = None
    forfeit_player_id: Optional[str] = None
