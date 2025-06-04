"""Tournament schemas for request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.models.tournament import TournamentFormat, TournamentStatus


class TournamentBase(BaseModel):
    """Base tournament schema."""

    name: str
    description: Optional[str] = None
    format: TournamentFormat
    max_participants: int = 32
    entry_fee: int = 0
    prize_pool: int = 0
    registration_deadline: Optional[datetime] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    best_of_sets: int = 3
    tiebreak_games: int = 6
    match_duration_limit: Optional[int] = None
    is_public: bool = True
    allow_registration: bool = True


class TournamentCreate(TournamentBase):
    """Schema for creating a tournament."""

    pass


class TournamentUpdate(BaseModel):
    """Schema for updating a tournament."""

    name: Optional[str] = None
    description: Optional[str] = None
    format: Optional[TournamentFormat] = None
    max_participants: Optional[int] = None
    entry_fee: Optional[int] = None
    prize_pool: Optional[int] = None
    registration_deadline: Optional[datetime] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    best_of_sets: Optional[int] = None
    tiebreak_games: Optional[int] = None
    match_duration_limit: Optional[int] = None
    status: Optional[TournamentStatus] = None
    is_public: Optional[bool] = None
    allow_registration: Optional[bool] = None


class TournamentResponse(TournamentBase):
    """Schema for tournament response."""

    id: str
    status: TournamentStatus
    organizer_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
