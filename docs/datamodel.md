# AI Tennis Tournament - Data Model Documentation

## Overview

The data model for the AI Tennis Tournament application is designed using SQLAlchemy 2.0+ with async support, providing type-safe database operations with modern Python patterns. The schema supports both PostgreSQL (production) and SQLite (development) databases.

## Database Technology Stack

### Core Technologies
- **ORM**: SQLAlchemy 2.0+ with async/await support
- **Migration Tool**: Alembic for schema version control  
- **Production Database**: PostgreSQL 15+ with asyncpg driver
- **Development Database**: SQLite with aiosqlite
- **Connection Management**: SQLAlchemy async engine with connection pooling

### Key Design Principles
- **UUID Primary Keys**: All entities use UUID strings for better scalability and security
- **Soft Deletes**: `is_active` flags instead of hard deletes for audit trails
- **Timestamps**: Automatic `created_at` and `updated_at` tracking on all entities
- **Enum Constraints**: Type-safe enums for status and categorical fields
- **Strategic Indexing**: Composite indexes for optimal query performance
- **Foreign Key Integrity**: Proper referential integrity with cascade options

## Core Entities and Relationships

### Entity Relationship Overview

```
Player (1) ────── (N) Registration (N) ────── (1) Tournament
  │                                                    │
  │                                                    │
  └── (1) ────── (N) Match ←──────────────────────────┘
                   │
                   └── (1) ────── (N) Set
                                   │
                                   └── (1) ────── (N) Game
```

### 1. Player Entity

#### SQLAlchemy Model
```python
# app/models/player.py
from sqlalchemy import Column, String, Boolean, Date, Enum, Text
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

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
    
    # Authentication & Contact
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    # Personal Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    display_name = Column(String(200))
    phone = Column(String(20))
    date_of_birth = Column(Date)
    
    # Tennis-specific Attributes
    skill_level = Column(Enum(SkillLevel), default=SkillLevel.INTERMEDIATE, index=True)
    preferred_hand = Column(Enum(PreferredHand), default=PreferredHand.RIGHT)
    
    # Status
    is_active = Column(Boolean, default=True, index=True)
    
    # Relationships
    registrations = relationship("Registration", back_populates="player")
    organized_tournaments = relationship("Tournament", back_populates="organizer")
    player1_matches = relationship("Match", foreign_keys="Match.player1_id")
    player2_matches = relationship("Match", foreign_keys="Match.player2_id")
    won_matches = relationship("Match", foreign_keys="Match.winner_id")
```

#### Business Rules
- **Unique Email**: Email addresses must be unique across the system
- **Password Security**: Passwords stored as bcrypt hashes (min 8 characters)
- **Display Name**: Auto-generated from first/last name if not provided
- **Skill Level**: Used for tournament matchmaking algorithms
- **Soft Delete**: Players are deactivated, not deleted, for data integrity

### 2. Tournament Entity

#### SQLAlchemy Model
```python
# app/models/tournament.py
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Enum, Text, ForeignKey
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

class TournamentFormat(PyEnum):
    ROUND_ROBIN = "ROUND_ROBIN"
    SINGLE_ELIMINATION = "SINGLE_ELIMINATION"
    DOUBLE_ELIMINATION = "DOUBLE_ELIMINATION"

class TournamentStatus(PyEnum):
    DRAFT = "DRAFT"
    REGISTRATION_OPEN = "REGISTRATION_OPEN"
    REGISTRATION_CLOSED = "REGISTRATION_CLOSED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Tournament(BaseModel):
    __tablename__ = "tournaments"
    
    # Basic Information
    name = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Tournament Configuration
    format = Column(Enum(TournamentFormat), nullable=False, index=True)
    max_participants = Column(Integer, default=32)
    entry_fee = Column(Integer, default=0)  # in cents
    prize_pool = Column(Integer, default=0)  # in cents
    
    # Scheduling
    registration_deadline = Column(DateTime(timezone=True))
    start_date = Column(DateTime(timezone=True), index=True)
    end_date = Column(DateTime(timezone=True))
    
    # Location
    venue_name = Column(String(200))
    venue_address = Column(Text)
    
    # Match Rules
    best_of_sets = Column(Integer, default=3)  # Best of 3 or 5 sets
    tiebreak_games = Column(Integer, default=6)  # Games before tiebreak
    match_duration_limit = Column(Integer)  # Minutes, null = no limit
    
    # Status and Access
    status = Column(Enum(TournamentStatus), default=TournamentStatus.DRAFT, index=True)
    is_public = Column(Boolean, default=True, index=True)
    allow_registration = Column(Boolean, default=True)
    
    # Organizer
    organizer_id = Column(String, ForeignKey("players.id"), nullable=False, index=True)
    
    # Relationships
    organizer = relationship("Player", back_populates="organized_tournaments")
    registrations = relationship("Registration", back_populates="tournament")
    matches = relationship("Match", back_populates="tournament")
```

#### Business Rules
- **Organizer Permissions**: Only INTERMEDIATE+ skill players can organize tournaments
- **Date Validation**: Registration deadline must be before start date
- **Participant Limits**: Max participants must be power of 2 for elimination formats
- **Entry Fees**: Stored in cents to avoid floating point precision issues
- **Status Workflow**: Draft → Registration Open → Closed → In Progress → Completed

### 3. Registration Entity

#### SQLAlchemy Model
```python
# app/models/registration.py
from sqlalchemy import Column, String, DateTime, Boolean, Enum, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

class RegistrationStatus(PyEnum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    WAITLISTED = "WAITLISTED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"

class Registration(BaseModel):
    __tablename__ = "registrations"
    
    # Foreign Keys
    player_id = Column(String, ForeignKey("players.id"), nullable=False, index=True)
    tournament_id = Column(String, ForeignKey("tournaments.id"), nullable=False, index=True)
    
    # Registration Workflow
    status = Column(Enum(RegistrationStatus), default=RegistrationStatus.PENDING, index=True)
    registration_date = Column(DateTime(timezone=True), server_default=func.now())
    confirmation_date = Column(DateTime(timezone=True))
    
    # Payment Tracking
    payment_status = Column(String(50), default="pending")  # pending, paid, refunded
    payment_reference = Column(String(100))
    
    # Additional Information
    notes = Column(Text)
    
    # Relationships
    player = relationship("Player", back_populates="registrations")
    tournament = relationship("Tournament", back_populates="registrations")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('player_id', 'tournament_id', name='unique_player_tournament'),
    )
```

#### Business Rules
- **Unique Registration**: One registration per player per tournament (database constraint)
- **Payment Flow**: Entry fee payment required before confirmation
- **Waitlist Management**: Automatic waitlist when tournament reaches capacity
- **Registration Window**: Only allowed when tournament status is REGISTRATION_OPEN

### 4. Match Entity

#### SQLAlchemy Model
```python
# app/models/match.py
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

class MatchStatus(PyEnum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FORFEIT = "FORFEIT"
    CANCELLED = "CANCELLED"

class MatchRound(PyEnum):
    # Round Robin
    ROUND_ROBIN = "ROUND_ROBIN"
    
    # Single Elimination Rounds
    ROUND_32 = "ROUND_32"
    ROUND_16 = "ROUND_16"
    QUARTER_FINAL = "QUARTER_FINAL"
    SEMI_FINAL = "SEMI_FINAL"
    FINAL = "FINAL"
    
    # Double Elimination
    WINNERS_BRACKET = "WINNERS_BRACKET"
    LOSERS_BRACKET = "LOSERS_BRACKET"
    GRAND_FINAL = "GRAND_FINAL"

class Match(BaseModel):
    __tablename__ = "matches"
    
    # Tournament Context
    tournament_id = Column(String, ForeignKey("tournaments.id"), nullable=False, index=True)
    round = Column(Enum(MatchRound), nullable=False, index=True)
    match_number = Column(Integer)  # Sequence within round
    
    # Participants
    player1_id = Column(String, ForeignKey("players.id"), nullable=False, index=True)
    player2_id = Column(String, ForeignKey("players.id"), index=True)  # Nullable for byes
    
    # Match Status and Timing
    status = Column(Enum(MatchStatus), default=MatchStatus.SCHEDULED, index=True)
    scheduled_at = Column(DateTime(timezone=True), index=True)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # Results
    winner_id = Column(String, ForeignKey("players.id"), index=True)
    forfeit_by = Column(String, ForeignKey("players.id"))  # Player who forfeited
    
    # Match Configuration
    best_of_sets = Column(Integer, default=3)
    
    # Court Assignment
    court_number = Column(String(20))
    
    # Relationships
    tournament = relationship("Tournament", back_populates="matches")
    player1 = relationship("Player", foreign_keys=[player1_id])
    player2 = relationship("Player", foreign_keys=[player2_id])
    winner = relationship("Player", foreign_keys=[winner_id])
    forfeit_player = relationship("Player", foreign_keys=[forfeit_by])
    sets = relationship("Set", back_populates="match", order_by="Set.set_number")
```

#### Business Rules
- **Player Requirements**: Match requires at least player1 (player2 nullable for byes)
- **Winner Validation**: Winner must be one of the two players or null (ongoing/forfeit)
- **Bracket Progression**: Match completion triggers next round generation
- **Timing Rules**: started_at must be after scheduled_at, completed_at after started_at

### 5. Set Entity

#### SQLAlchemy Model
```python
# app/models/set.py
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship

class Set(BaseModel):
    __tablename__ = "sets"
    
    # Match Context
    match_id = Column(String, ForeignKey("matches.id"), nullable=False, index=True)
    set_number = Column(Integer, nullable=False)  # 1, 2, 3, etc.
    
    # Game Score
    player1_games = Column(Integer, default=0)
    player2_games = Column(Integer, default=0)
    
    # Tiebreak Scoring
    is_tiebreak = Column(Boolean, default=False)
    player1_tiebreak_points = Column(Integer, default=0)
    player2_tiebreak_points = Column(Integer, default=0)
    
    # Set Status
    is_completed = Column(Boolean, default=False, index=True)
    winner_id = Column(String, ForeignKey("players.id"))
    
    # Relationships
    match = relationship("Match", back_populates="sets")
    winner = relationship("Player")
    games = relationship("Game", back_populates="set", order_by="Game.game_number")
```

#### Business Rules
- **Set Winning**: First to 6 games with 2-game lead, or 7-6 via tiebreak
- **Tiebreak Trigger**: Activated when games reach 6-6
- **Tiebreak Winning**: First to 7 points with 2-point lead
- **Set Completion**: Triggers match winner determination in best-of logic

### 6. Game Entity (Detailed Scoring)

#### SQLAlchemy Model
```python
# app/models/game.py
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship

class Game(BaseModel):
    __tablename__ = "games"
    
    # Set Context
    set_id = Column(String, ForeignKey("sets.id"), nullable=False, index=True)
    game_number = Column(Integer, nullable=False)  # 1, 2, 3, etc.
    
    # Point Score (0=0, 1=15, 2=30, 3=40, 4=game)
    player1_points = Column(Integer, default=0)
    player2_points = Column(Integer, default=0)
    
    # Deuce and Advantage
    is_deuce = Column(Boolean, default=False)
    advantage_player_id = Column(String, ForeignKey("players.id"))
    
    # Game Result
    is_completed = Column(Boolean, default=False)
    winner_id = Column(String, ForeignKey("players.id"))
    
    # Service
    server_id = Column(String, ForeignKey("players.id"), nullable=False)
    
    # Relationships
    set = relationship("Set", back_populates="games")
    winner = relationship("Player", foreign_keys=[winner_id])
    server = relationship("Player", foreign_keys=[server_id])
    advantage_player = relationship("Player", foreign_keys=[advantage_player_id])
```

## Database Performance and Indexing

### Strategic Indexes
```sql
-- Player lookups
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_players_skill_active ON players(skill_level, is_active);

-- Tournament queries
CREATE INDEX idx_tournaments_status_public ON tournaments(status, is_public);
CREATE INDEX idx_tournaments_start_date ON tournaments(start_date);

-- Registration lookups
CREATE INDEX idx_registrations_tournament_status ON registrations(tournament_id, status);
CREATE UNIQUE INDEX idx_unique_player_tournament ON registrations(player_id, tournament_id);

-- Match queries
CREATE INDEX idx_matches_tournament_round ON matches(tournament_id, round);
CREATE INDEX idx_matches_scheduled ON matches(scheduled_at);
CREATE INDEX idx_matches_status ON matches(status);

-- Performance for real-time updates
CREATE INDEX idx_sets_match_completed ON sets(match_id, is_completed);
```

### Query Optimization Patterns
```python
# Efficient tournament loading with relationships
async def get_tournament_with_matches(db: AsyncSession, tournament_id: str):
    result = await db.execute(
        select(Tournament)
        .where(Tournament.id == tournament_id)
        .options(
            selectinload(Tournament.matches).selectinload(Match.player1),
            selectinload(Tournament.matches).selectinload(Match.player2),
            selectinload(Tournament.matches).selectinload(Match.sets),
            selectinload(Tournament.registrations).selectinload(Registration.player)
        )
    )
    return result.scalar_one_or_none()

# Paginated match history with efficient counting
async def get_player_match_history(
    db: AsyncSession, 
    player_id: str, 
    page: int = 1, 
    limit: int = 20
):
    offset = (page - 1) * limit
    
    # Base query for matches involving the player
    base_query = select(Match).where(
        or_(Match.player1_id == player_id, Match.player2_id == player_id)
    ).where(Match.status == MatchStatus.COMPLETED)
    
    # Get total count
    count_result = await db.execute(
        select(func.count()).select_from(base_query.subquery())
    )
    total = count_result.scalar()
    
    # Get paginated matches
    matches_result = await db.execute(
        base_query
        .options(
            selectinload(Match.player1),
            selectinload(Match.player2),
            selectinload(Match.tournament),
            selectinload(Match.sets)
        )
        .order_by(Match.completed_at.desc())
        .offset(offset)
        .limit(limit)
    )
    
    return {
        "matches": matches_result.scalars().all(),
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }
```

## Database Migrations with Alembic

### Migration Configuration
```python
# alembic/env.py
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
from app.models.base import Base
from app.core.config import settings

# Import all models to register them
from app.models import player, tournament, registration, match, set, game

def run_migrations_online():
    connectable = create_async_engine(
        settings.database_url,
        poolclass=pool.NullPool
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=Base.metadata,
            compare_type=True,
            compare_server_default=True
        )

        with context.begin_transaction():
            context.run_migrations()
```

### Sample Migration
```python
# alembic/versions/001_create_initial_tables.py
"""Create initial tables

Revision ID: 001
Create Date: 2024-01-01 12:00:00
"""

from alembic import op
import sqlalchemy as sa

def upgrade():
    # Create players table
    op.create_table('players',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=False),
        sa.Column('display_name', sa.String(200), nullable=True),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('skill_level', sa.Enum('BEGINNER', 'INTERMEDIATE', 'ADVANCED'), nullable=True),
        sa.Column('preferred_hand', sa.Enum('RIGHT', 'LEFT', 'AMBIDEXTROUS'), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('idx_players_email', 'players', ['email'], unique=True)
    op.create_index('idx_players_skill_active', 'players', ['skill_level', 'is_active'])

def downgrade():
    op.drop_table('players')
```

## Data Integrity and Business Logic

### Check Constraints
```sql
-- Ensure valid game scores
ALTER TABLE sets ADD CONSTRAINT valid_game_scores CHECK (
    player1_games >= 0 AND player2_games >= 0 AND
    player1_games <= 7 AND player2_games <= 7
);

-- Ensure valid tiebreak logic
ALTER TABLE sets ADD CONSTRAINT valid_tiebreak CHECK (
    (is_tiebreak = false) OR 
    (is_tiebreak = true AND player1_games = 6 AND player2_games = 6)
);

-- Ensure tournament dates are logical
ALTER TABLE tournaments ADD CONSTRAINT valid_dates CHECK (
    start_date > registration_deadline AND
    end_date >= start_date
);
```

### Application-Level Validations
```python
# Service layer business rules
class MatchService:
    @staticmethod
    async def complete_set(db: AsyncSession, set_id: str, winner_id: str):
        """Complete a set and check if match is won."""
        set_obj = await get_set_by_id(db, set_id)
        
        # Validate set completion rules
        p1_games, p2_games = set_obj.player1_games, set_obj.player2_games
        
        if set_obj.is_tiebreak:
            # Tiebreak rules: first to 7 with 2 point lead
            p1_tb, p2_tb = set_obj.player1_tiebreak_points, set_obj.player2_tiebreak_points
            if not ((p1_tb >= 7 and p1_tb - p2_tb >= 2) or (p2_tb >= 7 and p2_tb - p1_tb >= 2)):
                raise ValueError("Invalid tiebreak score")
        else:
            # Regular set rules: first to 6 with 2 game lead, or 7-6
            if not ((p1_games >= 6 and p1_games - p2_games >= 2) or 
                   (p2_games >= 6 and p2_games - p1_games >= 2) or
                   (p1_games == 7 and p2_games == 6) or 
                   (p2_games == 7 and p1_games == 6)):
                raise ValueError("Invalid set score")
        
        # Mark set complete
        set_obj.is_completed = True
        set_obj.winner_id = winner_id
        await db.commit()
        
        # Check if match is complete
        await check_match_completion(db, set_obj.match_id)
```

This SQLAlchemy-based data model provides:
- **Type Safety**: Full Python type hints and enum validation
- **Performance**: Optimized indexes and efficient query patterns  
- **Scalability**: UUID primary keys and proper relationship design
- **Maintainability**: Alembic migrations and clear model separation
- **Flexibility**: Support for both summary and detailed scoring modes
- **Data Integrity**: Foreign key constraints and business rule validation