"""Player service for business logic operations."""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.player import Player
from app.schemas.player import PlayerCreate, PlayerUpdate
from app.core.security import get_password_hash, verify_password


class PlayerService:
    """Service class for player operations."""

    @staticmethod
    async def create(db: AsyncSession, player_data: PlayerCreate) -> Player:
        """Create a new player."""
        hashed_password = get_password_hash(player_data.password)

        player = Player(
            email=player_data.email,
            password_hash=hashed_password,
            first_name=player_data.first_name,
            last_name=player_data.last_name,
            display_name=player_data.display_name,
            phone=player_data.phone,
            date_of_birth=player_data.date_of_birth,
            skill_level=player_data.skill_level,
            preferred_hand=player_data.preferred_hand,
        )

        db.add(player)
        await db.commit()
        await db.refresh(player)
        return player

    @staticmethod
    async def get_by_id(db: AsyncSession, player_id: str) -> Optional[Player]:
        """Get player by ID."""
        result = await db.execute(select(Player).where(Player.id == player_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[Player]:
        """Get player by email."""
        result = await db.execute(select(Player).where(Player.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def authenticate(
        db: AsyncSession, email: str, password: str
    ) -> Optional[Player]:
        """Authenticate player with email and password."""
        player = await PlayerService.get_by_email(db, email)
        if not player:
            return None
        if not verify_password(password, player.password_hash):
            return None
        return player

    @staticmethod
    async def update(
        db: AsyncSession, player_id: str, player_data: PlayerUpdate
    ) -> Optional[Player]:
        """Update player information."""
        player = await PlayerService.get_by_id(db, player_id)
        if not player:
            return None

        update_data = player_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(player, field, value)

        await db.commit()
        await db.refresh(player)
        return player

    @staticmethod
    async def get_all(
        db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[Player]:
        """Get all players with pagination."""
        result = await db.execute(
            select(Player).where(Player.is_active == True).offset(skip).limit(limit)
        )
        return result.scalars().all()
