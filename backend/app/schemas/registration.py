"""Registration schemas for request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.models.registration import RegistrationStatus


class RegistrationBase(BaseModel):
    """Base registration schema."""

    tournament_id: str
    notes: Optional[str] = None


class RegistrationCreate(RegistrationBase):
    """Schema for creating a registration."""

    pass


class RegistrationUpdate(BaseModel):
    """Schema for updating a registration."""

    status: Optional[RegistrationStatus] = None
    notes: Optional[str] = None
    payment_status: Optional[str] = None
    payment_reference: Optional[str] = None


class RegistrationResponse(RegistrationBase):
    """Schema for registration response."""

    id: str
    player_id: str
    status: RegistrationStatus
    registration_date: datetime
    confirmation_date: Optional[datetime] = None
    payment_status: str

    class Config:
        from_attributes = True
