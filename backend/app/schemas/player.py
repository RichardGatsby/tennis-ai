"""Player schemas for request/response validation."""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

from app.models.player import SkillLevel, PreferredHand


class PlayerBase(BaseModel):
    """Base player schema."""

    email: EmailStr
    first_name: str
    last_name: str
    display_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    skill_level: SkillLevel = SkillLevel.INTERMEDIATE
    preferred_hand: PreferredHand = PreferredHand.RIGHT


class PlayerCreate(PlayerBase):
    """Schema for creating a new player."""

    password: str


class PlayerUpdate(BaseModel):
    """Schema for updating player information."""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    display_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    skill_level: Optional[SkillLevel] = None
    preferred_hand: Optional[PreferredHand] = None


class PlayerResponse(PlayerBase):
    """Schema for player response."""

    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PlayerLogin(BaseModel):
    """Schema for player login."""

    email: EmailStr
    password: str
