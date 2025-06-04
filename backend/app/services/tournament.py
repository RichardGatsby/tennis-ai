"""Tournament service for business logic operations."""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload

from app.models.tournament import Tournament, TournamentStatus
from app.models.registration import Registration
from app.schemas.tournament import TournamentCreate, TournamentUpdate


class TournamentService:
    """Service class for tournament operations."""

    @staticmethod
    async def create(
        db: AsyncSession, tournament_data: TournamentCreate, organizer_id: str
    ) -> Tournament:
        """Create a new tournament."""
        tournament = Tournament(
            name=tournament_data.name,
            description=tournament_data.description,
            format=tournament_data.format,
            max_participants=tournament_data.max_participants,
            entry_fee=tournament_data.entry_fee,
            prize_pool=tournament_data.prize_pool,
            registration_deadline=tournament_data.registration_deadline,
            start_date=tournament_data.start_date,
            end_date=tournament_data.end_date,
            venue_name=tournament_data.venue_name,
            venue_address=tournament_data.venue_address,
            best_of_sets=tournament_data.best_of_sets,
            tiebreak_games=tournament_data.tiebreak_games,
            match_duration_limit=tournament_data.match_duration_limit,
            is_public=tournament_data.is_public,
            allow_registration=tournament_data.allow_registration,
            organizer_id=organizer_id,
        )

        db.add(tournament)
        await db.commit()
        await db.refresh(tournament)
        return tournament

    @staticmethod
    async def get_by_id(db: AsyncSession, tournament_id: str) -> Optional[Tournament]:
        """Get tournament by ID with related data."""
        result = await db.execute(
            select(Tournament)
            .options(
                selectinload(Tournament.organizer),
                selectinload(Tournament.registrations),
                selectinload(Tournament.matches),
            )
            .where(Tournament.id == tournament_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        include_private: bool = False,
        status_filter: Optional[TournamentStatus] = None,
        organizer_id: Optional[str] = None,
    ) -> List[Tournament]:
        """Get all tournaments with filtering and pagination."""
        query = select(Tournament).options(selectinload(Tournament.organizer))

        # Apply filters
        conditions = []
        if not include_private:
            conditions.append(Tournament.is_public == True)
        if status_filter:
            conditions.append(Tournament.status == status_filter)
        if organizer_id:
            conditions.append(Tournament.organizer_id == organizer_id)

        if conditions:
            query = query.where(and_(*conditions))

        # Apply pagination
        query = query.offset(skip).limit(limit).order_by(Tournament.created_at.desc())

        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def update(
        db: AsyncSession, tournament_id: str, tournament_data: TournamentUpdate
    ) -> Optional[Tournament]:
        """Update tournament information."""
        tournament = await TournamentService.get_by_id(db, tournament_id)
        if not tournament:
            return None

        update_data = tournament_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tournament, field, value)

        await db.commit()
        await db.refresh(tournament)
        return tournament

    @staticmethod
    async def delete(db: AsyncSession, tournament_id: str) -> bool:
        """Soft delete a tournament by changing status to CANCELLED."""
        tournament = await TournamentService.get_by_id(db, tournament_id)
        if not tournament:
            return False

        tournament.status = TournamentStatus.CANCELLED
        await db.commit()
        return True

    @staticmethod
    async def get_by_organizer(
        db: AsyncSession, organizer_id: str, skip: int = 0, limit: int = 100
    ) -> List[Tournament]:
        """Get tournaments organized by a specific user."""
        return await TournamentService.get_all(
            db, skip=skip, limit=limit, include_private=True, organizer_id=organizer_id
        )

    @staticmethod
    async def search(
        db: AsyncSession, search_term: str, skip: int = 0, limit: int = 100
    ) -> List[Tournament]:
        """Search tournaments by name or description."""
        search_pattern = f"%{search_term}%"
        result = await db.execute(
            select(Tournament)
            .options(selectinload(Tournament.organizer))
            .where(
                and_(
                    Tournament.is_public == True,
                    or_(
                        Tournament.name.ilike(search_pattern),
                        Tournament.description.ilike(search_pattern),
                    ),
                )
            )
            .offset(skip)
            .limit(limit)
            .order_by(Tournament.created_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def get_registration_count(db: AsyncSession, tournament_id: str) -> int:
        """Get the number of confirmed registrations for a tournament."""
        result = await db.execute(
            select(Registration).where(
                and_(
                    Registration.tournament_id == tournament_id,
                    Registration.status == "CONFIRMED",
                )
            )
        )
        return len(result.scalars().all())

    @staticmethod
    async def can_register(db: AsyncSession, tournament_id: str) -> bool:
        """Check if tournament is open for registration."""
        tournament = await TournamentService.get_by_id(db, tournament_id)
        if not tournament:
            return False

        if not tournament.allow_registration:
            return False

        if tournament.status not in [
            TournamentStatus.DRAFT,
            TournamentStatus.REGISTRATION_OPEN,
        ]:
            return False

        # Check if tournament is full
        registration_count = await TournamentService.get_registration_count(
            db, tournament_id
        )
        if registration_count >= tournament.max_participants:
            return False

        return True
