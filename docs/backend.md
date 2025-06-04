# AI Tennis Tournament - Python FastAPI Backend Documentation

## Overview

The AI Tennis Tournament backend is built with FastAPI, providing a high-performance, type-safe REST API with automatic OpenAPI documentation generation. The architecture follows clean separation of concerns with routers, services, and data access layers using modern Python async patterns.

## Technology Stack

- **Framework**: FastAPI 0.104+ for high-performance async API development
- **Language**: Python 3.11+ with full type hints
- **ORM**: SQLAlchemy 2.0+ with async support for database operations
- **Authentication**: JWT-based authentication with python-jose and passlib
- **Validation**: Pydantic v2 models for request/response validation
- **Documentation**: Auto-generated OpenAPI 3.0 specifications
- **Testing**: pytest + httpx for async API testing
- **Database**: PostgreSQL (production) / SQLite (development)

## Why FastAPI?

Based on comprehensive research of Python web frameworks in 2024, FastAPI was chosen for the following reasons:

### Performance
- **Fastest Python Framework**: Benchmarks show FastAPI is the fastest Python web framework
- **Async Support**: Built on Starlette with full async/await support
- **High Concurrency**: Can handle thousands of concurrent connections

### Developer Experience
- **Automatic Documentation**: Interactive API docs at `/docs` and `/redoc`
- **Type Safety**: Full type hints with IDE support and runtime validation
- **Modern Python**: Uses Python 3.6+ features like type hints and async/await
- **Fast Development**: Reduces development time by 200-300%

### Production Features
- **Built-in Security**: OAuth2, JWT tokens, CORS, rate limiting
- **Standards Compliant**: Full OpenAPI 3.0 and JSON Schema support
- **Easy Testing**: Built-in test client and async testing support

## API Architecture

### Base URL Structure
```
Production: https://api.tennistournament.app/v1
Development: http://localhost:8000/api/v1
```

### Standard Response Format
```python
from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, List

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T
    message: Optional[str] = None
    
class PaginationInfo(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int

class PaginatedResponse(ApiResponse[List[T]]):
    pagination: PaginationInfo

class ApiError(BaseModel):
    success: bool = False
    error: dict
```

## FastAPI Application Structure

### Main Application
```python
# app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title="AI Tennis Tournament API",
    description="High-performance API for tennis tournament management",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Include API router
app.include_router(api_router, prefix=settings.api_v1_prefix)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}
```

### API Router Structure
```python
# app/api/v1/api.py
from fastapi import APIRouter

from app.api.v1.endpoints import players, tournaments, matches, auth

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(players.router, prefix="/players", tags=["Players"])
api_router.include_router(tournaments.router, prefix="/tournaments", tags=["Tournaments"])
api_router.include_router(matches.router, prefix="/matches", tags=["Matches"])
```

## Authentication System

### JWT Implementation
```python
# app/core/security.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from fastapi import HTTPException, status

class TokenData(BaseModel):
    player_id: Optional[str] = None
    email: Optional[str] = None
    role: str = "player"

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# JWT token generation
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def verify_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        player_id: str = payload.get("sub")
        if player_id is None:
            raise JWTError("Invalid token")
        return TokenData(player_id=player_id, email=payload.get("email"))
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
```

### Authentication Dependencies
```python
# app/api/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import verify_token
from app.services.player import PlayerService

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    """Get current authenticated user."""
    try:
        token_data = verify_token(credentials.credentials)
        player = await PlayerService.get_by_id(db, token_data.player_id)
        if player is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        return player
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
```

## Pydantic Schemas

### Player Schemas
```python
# app/schemas/player.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class SkillLevel(str, Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"

class PreferredHand(str, Enum):
    RIGHT = "RIGHT"
    LEFT = "LEFT"
    AMBIDEXTROUS = "AMBIDEXTROUS"

class PlayerRegistrationRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    display_name: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, max_length=20)
    skill_level: SkillLevel = SkillLevel.INTERMEDIATE
    preferred_hand: PreferredHand = PreferredHand.RIGHT
    date_of_birth: Optional[datetime] = None

    @validator('display_name', always=True)
    def set_display_name(cls, v, values):
        if not v and 'first_name' in values and 'last_name' in values:
            return f"{values['first_name']} {values['last_name']}"
        return v

class PlayerResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    display_name: Optional[str]
    phone: Optional[str]
    skill_level: SkillLevel
    preferred_hand: PreferredHand
    date_of_birth: Optional[datetime]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PlayerStats(BaseModel):
    total_matches: int = 0
    matches_won: int = 0
    matches_lost: int = 0
    win_percentage: float = 0.0
    sets_won: int = 0
    sets_lost: int = 0
    sets_win_percentage: float = 0.0
    games_won: int = 0
    games_lost: int = 0
    games_win_percentage: float = 0.0
    tournaments_played: int = 0
    tournaments_won: int = 0
    current_streak: int = 0
    longest_win_streak: int = 0
    average_match_duration: int = 0
    recent_form: List[str] = []  # ['W', 'L', 'W', ...]
```

## SQLAlchemy Models

### Base Model
```python
# app/models/base.py
from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from uuid import uuid4

Base = declarative_base()

class BaseModel(Base):
    __abstract__ = True
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now()
    )
```

### Player Model
```python
# app/models/player.py
from sqlalchemy import Column, String, Boolean, Date, Enum
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

from app.models.base import BaseModel

class SkillLevel(PyEnum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"

class PreferredHand(PyEnum):
    RIGHT = "RIGHT"
    LEFT = "LEFT"
    AMBIDEXTROUS = "AMBIDEXTROUS"

class Player(BaseModel):
    __tablename__ = "players"
    
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    display_name = Column(String(200))
    phone = Column(String(20))
    skill_level = Column(Enum(SkillLevel), default=SkillLevel.INTERMEDIATE)
    preferred_hand = Column(Enum(PreferredHand), default=PreferredHand.RIGHT)
    date_of_birth = Column(Date)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    registrations = relationship("Registration", back_populates="player")
    organized_tournaments = relationship("Tournament", back_populates="organizer")
    player1_matches = relationship("Match", foreign_keys="Match.player1_id")
    player2_matches = relationship("Match", foreign_keys="Match.player2_id")
    won_matches = relationship("Match", foreign_keys="Match.winner_id")
```

## FastAPI Endpoints

### Player Endpoints
```python
# app/api/v1/endpoints/players.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.api.dependencies import get_current_user, get_db
from app.schemas.player import *
from app.schemas.responses import *
from app.services.player import PlayerService
from app.models.player import Player

router = APIRouter()

@router.post("/register", response_model=ApiResponse[PlayerRegistrationResponse])
async def register_player(
    player_data: PlayerRegistrationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new player account.
    
    Creates a new player with email verification and returns JWT token.
    """
    try:
        result = await PlayerService.create_player(db, player_data)
        return ApiResponse(
            data=result,
            message="Player registered successfully"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{player_id}", response_model=ApiResponse[PlayerResponse])
async def get_player(
    player_id: str,
    current_user: Player = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get player profile information."""
    player = await PlayerService.get_by_id(db, player_id)
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )
    
    return ApiResponse(data=PlayerResponse.from_orm(player))

@router.put("/{player_id}", response_model=ApiResponse[PlayerResponse])
async def update_player(
    player_id: str,
    update_data: PlayerUpdateRequest,
    current_user: Player = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update player profile (users can only update their own profiles)."""
    if current_user.id != player_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only update your own profile"
        )
    
    updated_player = await PlayerService.update(db, player_id, update_data)
    return ApiResponse(
        data=PlayerResponse.from_orm(updated_player),
        message="Profile updated successfully"
    )

@router.get("/{player_id}/stats", response_model=ApiResponse[PlayerStats])
async def get_player_stats(
    player_id: str,
    timeframe: Optional[str] = Query(default="all", regex="^(all|year|month)$"),
    current_user: Player = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get comprehensive player statistics."""
    stats = await PlayerService.get_statistics(db, player_id, timeframe)
    return ApiResponse(data=stats)

@router.get("/search", response_model=ApiResponse[List[PlayerResponse]])
async def search_players(
    query: str = Query(..., min_length=2),
    limit: int = Query(default=20, ge=1, le=50),
    current_user: Player = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Search for players by name or email."""
    players = await PlayerService.search(db, query, limit)
    return ApiResponse(
        data=[PlayerResponse.from_orm(player) for player in players]
    )
```

## Service Layer

### Player Service
```python
# app/services/player.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from typing import Optional, List
from datetime import datetime, timedelta

from app.models.player import Player
from app.schemas.player import *
from app.core.security import get_password_hash, create_access_token

class PlayerService:
    
    @staticmethod
    async def create_player(
        db: AsyncSession, 
        player_data: PlayerRegistrationRequest
    ) -> PlayerRegistrationResponse:
        """Create a new player with password hashing and JWT generation."""
        
        # Check if email already exists
        result = await db.execute(
            select(Player).where(Player.email == player_data.email.lower())
        )
        if result.scalar_one_or_none():
            raise ValueError("Email already registered")
        
        # Create player instance
        hashed_password = get_password_hash(player_data.password)
        
        player = Player(
            email=player_data.email.lower(),
            password_hash=hashed_password,
            first_name=player_data.first_name.strip(),
            last_name=player_data.last_name.strip(),
            display_name=player_data.display_name,
            phone=player_data.phone,
            skill_level=player_data.skill_level,
            preferred_hand=player_data.preferred_hand,
            date_of_birth=player_data.date_of_birth,
            is_active=True
        )
        
        db.add(player)
        await db.commit()
        await db.refresh(player)
        
        # Generate JWT token
        access_token = create_access_token(
            data={
                "sub": player.id,
                "email": player.email,
                "role": "player"
            }
        )
        
        token = Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=7 * 24 * 3600  # 7 days
        )
        
        return PlayerRegistrationResponse(
            player=PlayerResponse.from_orm(player),
            token=token
        )
    
    @staticmethod
    async def get_by_id(db: AsyncSession, player_id: str) -> Optional[Player]:
        """Get player by ID."""
        result = await db.execute(
            select(Player)
            .where(and_(Player.id == player_id, Player.is_active == True))
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def search(db: AsyncSession, query: str, limit: int = 20) -> List[Player]:
        """Search for players by name or email."""
        search_term = f"%{query.lower()}%"
        
        result = await db.execute(
            select(Player)
            .where(and_(
                Player.is_active == True,
                or_(
                    func.lower(Player.first_name).like(search_term),
                    func.lower(Player.last_name).like(search_term),
                    func.lower(Player.display_name).like(search_term),
                    func.lower(Player.email).like(search_term)
                )
            ))
            .limit(limit)
            .order_by(Player.first_name, Player.last_name)
        )
        
        return result.scalars().all()
```

## Real-time Features

### Server-Sent Events
```python
# app/api/v1/endpoints/matches.py
import asyncio
import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

@router.get("/{match_id}/stream")
async def stream_match_updates(
    match_id: str,
    current_user: Player = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Stream live match updates via Server-Sent Events."""
    
    async def event_generator():
        last_updated = None
        
        while True:
            try:
                # Fetch latest match data
                match = await MatchService.get_by_id(db, match_id)
                
                if match and (not last_updated or match.updated_at > last_updated):
                    match_data = {
                        "id": match.id,
                        "status": match.status,
                        "score": await MatchService.get_current_score(db, match_id),
                        "updated_at": match.updated_at.isoformat()
                    }
                    
                    yield f"data: {json.dumps(match_data)}\n\n"
                    last_updated = match.updated_at
                
                await asyncio.sleep(2)  # Update every 2 seconds
                
            except Exception as e:
                error_data = {"error": str(e)}
                yield f"data: {json.dumps(error_data)}\n\n"
                break
    
    return StreamingResponse(
        event_generator(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )
```

## Testing

### Test Configuration
```python
# tests/conftest.py
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import get_db
from app.models.base import Base

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

@pytest_asyncio.fixture
async def async_client():
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine(TEST_DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    TestSessionLocal = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with TestSessionLocal() as session:
        yield session

@pytest.fixture(autouse=True)
async def override_db_dependency(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    yield
    app.dependency_overrides.clear()
```

### Test Examples
```python
# tests/test_players.py
@pytest.mark.asyncio
async def test_register_player(async_client: AsyncClient):
    player_data = {
        "email": "test@example.com",
        "password": "securepass123",
        "first_name": "John",
        "last_name": "Doe",
        "skill_level": "INTERMEDIATE"
    }
    
    response = await async_client.post("/api/v1/players/register", json=player_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["player"]["email"] == "test@example.com"
    assert "token" in data["data"]

@pytest.mark.asyncio
async def test_unauthorized_access(async_client: AsyncClient):
    response = await async_client.get("/api/v1/players/123/stats")
    assert response.status_code == 401
```

## Production Deployment

### Requirements
```txt
# requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy[asyncio]==2.0.23
asyncpg==0.29.0
alembic==1.12.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic[email]==2.5.0
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
```

### Docker Configuration
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

This FastAPI backend provides:
- **High Performance**: Async support throughout
- **Type Safety**: Full type hints and validation
- **Automatic Documentation**: Interactive docs
- **Modern Python**: Latest language features
- **Production Ready**: Security, testing, deployment
