"""Match service for business logic operations."""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.sql import func

from app.models.match import Match, MatchStatus, MatchRound
from app.models.tournament import Tournament
from app.schemas.match import MatchCreate, MatchUpdate


class MatchService:
    """Service class for match operations."""

    @staticmethod
    async def create(db: AsyncSession, match_data: MatchCreate) -> Match:
        """Create a new match."""
        match = Match(
            tournament_id=match_data.tournament_id,
            round=match_data.round,
            match_number=match_data.match_number,
            player1_id=match_data.player1_id,
            player2_id=match_data.player2_id,
            scheduled_at=match_data.scheduled_at,
            best_of_sets=match_data.best_of_sets,
            court_number=match_data.court_number,
        )

        db.add(match)
        await db.commit()
        await db.refresh(match)
        return match

    @staticmethod
    async def get_by_id(db: AsyncSession, match_id: str) -> Optional[Match]:
        """Get match by ID with related data."""
        result = await db.execute(
            select(Match)
            .options(
                selectinload(Match.tournament),
                selectinload(Match.player1),
                selectinload(Match.player2),
                selectinload(Match.winner),
                selectinload(Match.sets),
            )
            .where(Match.id == match_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        tournament_id: Optional[str] = None,
        player_id: Optional[str] = None,
        status_filter: Optional[MatchStatus] = None,
        round_filter: Optional[MatchRound] = None,
    ) -> List[Match]:
        """Get all matches with filtering and pagination."""
        query = select(Match).options(
            selectinload(Match.tournament),
            selectinload(Match.player1),
            selectinload(Match.player2),
            selectinload(Match.winner),
        )

        # Apply filters
        conditions = []
        if tournament_id:
            conditions.append(Match.tournament_id == tournament_id)
        if player_id:
            conditions.append(
                or_(Match.player1_id == player_id, Match.player2_id == player_id)
            )
        if status_filter:
            conditions.append(Match.status == status_filter)
        if round_filter:
            conditions.append(Match.round == round_filter)

        if conditions:
            query = query.where(and_(*conditions))

        # Apply pagination and ordering
        query = query.offset(skip).limit(limit).order_by(Match.scheduled_at.asc())

        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def update(
        db: AsyncSession, match_id: str, match_data: MatchUpdate
    ) -> Optional[Match]:
        """Update match information."""
        match = await MatchService.get_by_id(db, match_id)
        if not match:
            return None

        update_data = match_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(match, field, value)

        await db.commit()
        await db.refresh(match)
        return match

    @staticmethod
    async def start_match(db: AsyncSession, match_id: str) -> Optional[Match]:
        """Start a match by updating its status."""
        match = await MatchService.get_by_id(db, match_id)
        if not match:
            return None

        if match.status != MatchStatus.SCHEDULED:
            return None

        match.status = MatchStatus.IN_PROGRESS
        match.started_at = func.now()

        await db.commit()
        await db.refresh(match)
        return match

    @staticmethod
    async def complete_match(
        db: AsyncSession, match_id: str, winner_id: Optional[str] = None
    ) -> Optional[Match]:
        """Complete a match by setting winner and status."""
        match = await MatchService.get_by_id(db, match_id)
        if not match:
            return None

        if match.status != MatchStatus.IN_PROGRESS:
            return None

        match.status = MatchStatus.COMPLETED
        match.completed_at = func.now()
        if winner_id:
            match.winner_id = winner_id

        await db.commit()
        await db.refresh(match)
        return match

    @staticmethod
    async def forfeit_match(
        db: AsyncSession, match_id: str, forfeit_player_id: str
    ) -> Optional[Match]:
        """Handle match forfeit."""
        match = await MatchService.get_by_id(db, match_id)
        if not match:
            return None

        if match.status not in [MatchStatus.SCHEDULED, MatchStatus.IN_PROGRESS]:
            return None

        match.status = MatchStatus.FORFEIT
        match.forfeit_by = forfeit_player_id
        match.completed_at = func.now()

        # Set winner as the other player
        if forfeit_player_id == match.player1_id:
            match.winner_id = match.player2_id
        elif forfeit_player_id == match.player2_id:
            match.winner_id = match.player1_id

        await db.commit()
        await db.refresh(match)
        return match

    @staticmethod
    async def get_by_tournament(
        db: AsyncSession, tournament_id: str, skip: int = 0, limit: int = 100
    ) -> List[Match]:
        """Get all matches for a specific tournament."""
        return await MatchService.get_all(
            db, skip=skip, limit=limit, tournament_id=tournament_id
        )

    @staticmethod
    async def get_by_player(
        db: AsyncSession, player_id: str, skip: int = 0, limit: int = 100
    ) -> List[Match]:
        """Get all matches for a specific player."""
        return await MatchService.get_all(
            db, skip=skip, limit=limit, player_id=player_id
        )

    @staticmethod
    async def get_upcoming_matches(
        db: AsyncSession,
        player_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Match]:
        """Get upcoming scheduled matches."""
        return await MatchService.get_all(
            db,
            skip=skip,
            limit=limit,
            player_id=player_id,
            status_filter=MatchStatus.SCHEDULED,
        )

    @staticmethod
    async def get_live_matches(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[Match]:
        """Get currently in-progress matches."""
        return await MatchService.get_all(
            db, skip=skip, limit=limit, status_filter=MatchStatus.IN_PROGRESS
        )
