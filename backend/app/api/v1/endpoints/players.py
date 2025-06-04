"""Player endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_user
from app.core.database import get_db
from app.models.player import Player
from app.schemas.player import PlayerResponse, PlayerUpdate
from app.services.player import PlayerService

router = APIRouter()


@router.get("/me", response_model=PlayerResponse)
async def get_current_player(current_user: Player = Depends(get_current_active_user)):
    """Get current player profile."""
    return current_user


@router.put("/me", response_model=PlayerResponse)
async def update_current_player(
    player_data: PlayerUpdate,
    current_user: Player = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current player profile."""
    updated_player = await PlayerService.update(db, current_user.id, player_data)
    if not updated_player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Player not found"
        )
    return updated_player


@router.get("/{player_id}", response_model=PlayerResponse)
async def get_player(
    player_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Player = Depends(get_current_active_user),
):
    """Get player by ID."""
    player = await PlayerService.get_by_id(db, player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Player not found"
        )
    return player


@router.get("/", response_model=List[PlayerResponse])
async def get_players(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: Player = Depends(get_current_active_user),
):
    """Get all players with pagination."""
    players = await PlayerService.get_all(db, skip=skip, limit=limit)
    return players
