"""Tournament endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_user
from app.core.database import get_db
from app.models.player import Player
from app.models.tournament import TournamentStatus
from app.schemas.tournament import (
    TournamentCreate,
    TournamentUpdate,
    TournamentResponse,
)
from app.schemas.registration import RegistrationCreate, RegistrationResponse
from app.services.tournament import TournamentService
from app.services.registration import RegistrationService

router = APIRouter()


@router.post("/", response_model=TournamentResponse)
async def create_tournament(
    tournament_data: TournamentCreate,
    current_user: Player = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new tournament."""
    tournament = await TournamentService.create(db, tournament_data, current_user.id)
    return tournament


@router.get("/", response_model=List[TournamentResponse])
async def get_tournaments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[TournamentStatus] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Player = Depends(get_current_active_user),
):
    """Get all tournaments with filtering and pagination."""
    if search:
        tournaments = await TournamentService.search(db, search, skip, limit)
    else:
        tournaments = await TournamentService.get_all(
            db, skip=skip, limit=limit, status_filter=status
        )
    return tournaments


@router.get("/{tournament_id}", response_model=TournamentResponse)
async def get_tournament(
    tournament_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Player = Depends(get_current_active_user),
):
    """Get tournament by ID."""
    tournament = await TournamentService.get_by_id(db, tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found"
        )

    # Check if user can view private tournaments
    if not tournament.is_public and tournament.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this tournament",
        )

    return tournament


@router.put("/{tournament_id}", response_model=TournamentResponse)
async def update_tournament(
    tournament_id: str,
    tournament_data: TournamentUpdate,
    current_user: Player = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update tournament information (organizer only)."""
    tournament = await TournamentService.get_by_id(db, tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found"
        )

    # Check if user is the organizer
    if tournament.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament organizers can update tournaments",
        )

    updated_tournament = await TournamentService.update(
        db, tournament_id, tournament_data
    )
    return updated_tournament


@router.delete("/{tournament_id}")
async def delete_tournament(
    tournament_id: str,
    current_user: Player = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel/delete tournament (organizer only)."""
    tournament = await TournamentService.get_by_id(db, tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found"
        )

    # Check if user is the organizer
    if tournament.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament organizers can cancel tournaments",
        )

    success = await TournamentService.delete(db, tournament_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not cancel tournament",
        )

    return {"message": "Tournament cancelled successfully"}


@router.get("/my/organized", response_model=List[TournamentResponse])
async def get_my_tournaments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: Player = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get tournaments organized by current user."""
    tournaments = await TournamentService.get_by_organizer(
        db, current_user.id, skip, limit
    )
    return tournaments


# Registration endpoints
@router.post("/{tournament_id}/register", response_model=RegistrationResponse)
async def register_for_tournament(
    tournament_id: str,
    registration_data: RegistrationCreate,
    current_user: Player = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Register current user for a tournament."""
    # Verify tournament exists and is open for registration
    tournament = await TournamentService.get_by_id(db, tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found"
        )

    # Check if tournament allows registration
    can_register = await TournamentService.can_register(db, tournament_id)
    if not can_register:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament is not open for registration or is full",
        )

    # Check if user is already registered
    existing_registration = await RegistrationService.get_by_player_and_tournament(
        db, current_user.id, tournament_id
    )
    if existing_registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already registered for this tournament",
        )

    # Ensure the registration is for the correct tournament
    registration_data.tournament_id = tournament_id

    registration = await RegistrationService.create(
        db, registration_data, current_user.id
    )
    return registration


@router.get("/{tournament_id}/registrations", response_model=List[RegistrationResponse])
async def get_tournament_registrations(
    tournament_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: Player = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all registrations for a tournament (organizer only)."""
    tournament = await TournamentService.get_by_id(db, tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found"
        )

    # Check if user is the organizer
    if tournament.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament organizers can view registrations",
        )

    registrations = await RegistrationService.get_by_tournament(
        db, tournament_id, skip, limit
    )
    return registrations


@router.get("/registrations/my", response_model=List[RegistrationResponse])
async def get_my_registrations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: Player = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's tournament registrations."""
    registrations = await RegistrationService.get_by_player(
        db, current_user.id, skip, limit
    )
    return registrations
