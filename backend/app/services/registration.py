"""Registration service for tournament enrollment operations."""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.models.registration import Registration, RegistrationStatus
from app.schemas.registration import RegistrationCreate, RegistrationUpdate


class RegistrationService:
    """Service class for registration operations."""

    @staticmethod
    async def create(
        db: AsyncSession, registration_data: RegistrationCreate, player_id: str
    ) -> Registration:
        """Create a new tournament registration."""
        registration = Registration(
            player_id=player_id,
            tournament_id=registration_data.tournament_id,
            notes=registration_data.notes,
        )

        db.add(registration)
        await db.commit()
        await db.refresh(registration)
        return registration

    @staticmethod
    async def get_by_id(
        db: AsyncSession, registration_id: str
    ) -> Optional[Registration]:
        """Get registration by ID with related data."""
        result = await db.execute(
            select(Registration)
            .options(
                selectinload(Registration.player),
                selectinload(Registration.tournament),
            )
            .where(Registration.id == registration_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_player_and_tournament(
        db: AsyncSession, player_id: str, tournament_id: str
    ) -> Optional[Registration]:
        """Get registration by player and tournament."""
        result = await db.execute(
            select(Registration).where(
                and_(
                    Registration.player_id == player_id,
                    Registration.tournament_id == tournament_id,
                )
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_tournament(
        db: AsyncSession, tournament_id: str, skip: int = 0, limit: int = 100
    ) -> List[Registration]:
        """Get all registrations for a tournament."""
        result = await db.execute(
            select(Registration)
            .options(selectinload(Registration.player))
            .where(Registration.tournament_id == tournament_id)
            .offset(skip)
            .limit(limit)
            .order_by(Registration.registration_date.asc())
        )
        return result.scalars().all()

    @staticmethod
    async def get_by_player(
        db: AsyncSession, player_id: str, skip: int = 0, limit: int = 100
    ) -> List[Registration]:
        """Get all registrations for a player."""
        result = await db.execute(
            select(Registration)
            .options(selectinload(Registration.tournament))
            .where(Registration.player_id == player_id)
            .offset(skip)
            .limit(limit)
            .order_by(Registration.registration_date.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def update(
        db: AsyncSession, registration_id: str, registration_data: RegistrationUpdate
    ) -> Optional[Registration]:
        """Update registration information."""
        registration = await RegistrationService.get_by_id(db, registration_id)
        if not registration:
            return None

        update_data = registration_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(registration, field, value)

        await db.commit()
        await db.refresh(registration)
        return registration

    @staticmethod
    async def confirm(db: AsyncSession, registration_id: str) -> Optional[Registration]:
        """Confirm a pending registration."""
        registration = await RegistrationService.get_by_id(db, registration_id)
        if not registration:
            return None

        if registration.status != RegistrationStatus.PENDING:
            return None

        registration.status = RegistrationStatus.CONFIRMED
        from sqlalchemy.sql import func

        registration.confirmation_date = func.now()

        await db.commit()
        await db.refresh(registration)
        return registration

    @staticmethod
    async def cancel(db: AsyncSession, registration_id: str) -> Optional[Registration]:
        """Cancel a registration."""
        registration = await RegistrationService.get_by_id(db, registration_id)
        if not registration:
            return None

        registration.status = RegistrationStatus.CANCELLED

        await db.commit()
        await db.refresh(registration)
        return registration

    @staticmethod
    async def get_confirmed_count(db: AsyncSession, tournament_id: str) -> int:
        """Get count of confirmed registrations for a tournament."""
        result = await db.execute(
            select(Registration).where(
                and_(
                    Registration.tournament_id == tournament_id,
                    Registration.status == RegistrationStatus.CONFIRMED,
                )
            )
        )
        return len(result.scalars().all())
