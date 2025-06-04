"""Match endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_active_user
from app.core.database import get_db
from app.models.player import Player
from app.models.match import MatchStatus, MatchRound
from app.schemas.match import MatchCreate, MatchUpdate, MatchResponse, MatchStatusUpdate
from app.services.match import MatchService
from app.services.tournament import TournamentService

router = APIRouter()


@router.post("/", response_model=MatchResponse)
async def create_match(
    match_data: MatchCreate,
    current_user: Player = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new match (tournament organizer only)."""
    # Verify tournament exists and user is organizer
    tournament = await TournamentService.get_by_id(db, match_data.tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found"
        )

    if tournament.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament organizers can create matches",
        )

    match = await MatchService.create(db, match_data)
    return match


@router.get("/", response_model=List[MatchResponse])
async def get_matches(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tournament_id: Optional[str] = Query(None),
    player_id: Optional[str] = Query(None),
    status: Optional[MatchStatus] = Query(None),
    round: Optional[MatchRound] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Player = Depends(get_current_active_user),
):
    """Get all matches with filtering and pagination."""
    matches = await MatchService.get_all(
        db,
        skip=skip,
        limit=limit,
        tournament_id=tournament_id,
        player_id=player_id,
        status_filter=status,
        round_filter=round,
    )
    return matches


@router.get("/live", response_model=List[MatchResponse])
async def get_live_matches(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: Player = Depends(get_current_active_user),
):
    """Get currently in-progress matches."""
    matches = await MatchService.get_live_matches(db, skip, limit)
    return matches


@router.get("/upcoming", response_model=List[MatchResponse])
async def get_upcoming_matches(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    player_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: Player = Depends(get_current_active_user),
):
    """Get upcoming scheduled matches."""
    # If no player_id specified, default to current user's matches
    if player_id is None:
        player_id = current_user.id

    matches = await MatchService.get_upcoming_matches(db, player_id, skip, limit)
    return matches


@router.get("/my", response_model=List[MatchResponse])
async def get_my_matches(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: Player = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's matches."""
    matches = await MatchService.get_by_player(db, current_user.id, skip, limit)
    return matches


@router.get("/{match_id}", response_model=MatchResponse)
async def get_match(
    match_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Player = Depends(get_current_active_user),
):
    """Get match by ID."""
    match = await MatchService.get_by_id(db, match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Match not found"
        )
    return match


@router.put("/{match_id}", response_model=MatchResponse)
async def update_match(
    match_id: str,
    match_data: MatchUpdate,
    current_user: Player = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update match information (tournament organizer only)."""
    match = await MatchService.get_by_id(db, match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Match not found"
        )

    # Verify user is tournament organizer
    tournament = await TournamentService.get_by_id(db, match.tournament_id)
    if not tournament or tournament.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament organizers can update matches",
        )

    updated_match = await MatchService.update(db, match_id, match_data)
    return updated_match


@router.post("/{match_id}/status", response_model=MatchResponse)
async def update_match_status(
    match_id: str,
    status_data: MatchStatusUpdate,
    current_user: Player = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update match status (start, complete, forfeit)."""
    match = await MatchService.get_by_id(db, match_id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Match not found"
        )

    # Check authorization - organizer or player in match
    tournament = await TournamentService.get_by_id(db, match.tournament_id)
    is_organizer = tournament and tournament.organizer_id == current_user.id
    is_player = current_user.id in [match.player1_id, match.player2_id]

    if not (is_organizer or is_player):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this match",
        )

    if status_data.action == "start":
        updated_match = await MatchService.start_match(db, match_id)
    elif status_data.action == "complete":
        if not status_data.winner_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Winner ID required to complete match",
            )
        updated_match = await MatchService.complete_match(
            db, match_id, status_data.winner_id
        )
    elif status_data.action == "forfeit":
        if not status_data.forfeit_player_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Forfeit player ID required",
            )
        # Only allow player to forfeit their own match
        if not is_organizer and status_data.forfeit_player_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only forfeit your own match",
            )
        updated_match = await MatchService.forfeit_match(
            db, match_id, status_data.forfeit_player_id
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action. Must be 'start', 'complete', or 'forfeit'",
        )

    if not updated_match:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not update match status",
        )

    return updated_match


@router.get("/tournaments/{tournament_id}", response_model=List[MatchResponse])
async def get_tournament_matches(
    tournament_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: Player = Depends(get_current_active_user),
):
    """Get all matches for a specific tournament."""
    # Verify tournament exists
    tournament = await TournamentService.get_by_id(db, tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tournament not found"
        )

    matches = await MatchService.get_by_tournament(db, tournament_id, skip, limit)
    return matches
