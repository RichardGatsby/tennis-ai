"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token, Token
from app.schemas.player import PlayerCreate, PlayerLogin, PlayerResponse
from app.services.player import PlayerService

router = APIRouter()


@router.post("/register", response_model=PlayerResponse)
async def register(player_data: PlayerCreate, db: AsyncSession = Depends(get_db)):
    """Register a new player."""
    # Check if email already exists
    existing_player = await PlayerService.get_by_email(db, player_data.email)
    if existing_player:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create new player
    player = await PlayerService.create(db, player_data)
    return player


@router.post("/login", response_model=Token)
async def login(login_data: PlayerLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate player and return access token."""
    player = await PlayerService.authenticate(db, login_data.email, login_data.password)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not player.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    # Create access token
    access_token = create_access_token(data={"sub": player.id, "email": player.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 10080,  # 7 days in minutes
    }
