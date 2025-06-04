# AI Tennis Tournament - Architecture Documentation

## Technology Stack

### Frontend (NextJS 15)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API + useReducer for complex state
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: Native fetch with SWR for caching
- **Real-time Updates**: Server-Sent Events (SSE) for live match updates

### Backend (Python + FastAPI)
- **Framework**: FastAPI 0.104+ for high-performance API development
- **Language**: Python 3.11+ with type hints
- **API Documentation**: Auto-generated OpenAPI 3.0 specs via FastAPI
- **Validation**: Pydantic models for request/response validation
- **Database ORM**: SQLAlchemy 2.0+ with async support for database operations
- **Authentication**: JWT-based authentication with python-jose
- **Real-time**: Server-Sent Events for live updates via FastAPI streaming
- **Testing**: pytest + httpx for async API testing

### Database
- **Primary Database**: PostgreSQL for production with asyncpg driver
- **Development Database**: SQLite for local development
- **ORM**: SQLAlchemy 2.0 with Alembic for schema management and migrations
- **Connection Pool**: Built-in SQLAlchemy async connection pooling

### Development Tools
- **Package Manager**: pip with requirements.txt (or Poetry for advanced dependency management)
- **Testing Framework**: 
  - Backend: pytest + httpx for async API testing
  - Frontend: Jest + React Testing Library
  - E2E: Playwright
- **Code Quality**: Black (formatting) + isort (imports) + flake8/ruff (linting)
- **Type Checking**: mypy for static type checking
- **API Testing**: Automated tests against FastAPI's generated OpenAPI specs

## Project Structure

```
ai-tennis-tournament/
├── README.md
├── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── tournaments/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── bracket/
│   │   │   │   │   │   ├── matches/
│   │   │   │   │   │   └── standings/
│   │   │   │   │   ├── create/
│   │   │   │   │   └── manage/
│   │   │   │   ├── matches/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   ├── profile/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── history/
│   │   │   │   │   └── statistics/
│   │   │   │   └── layout.tsx
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   └── table.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Navigation.tsx
│   │   │   ├── tournament/
│   │   │   │   ├── TournamentCard.tsx
│   │   │   │   ├── TournamentForm.tsx
│   │   │   │   ├── BracketView.tsx
│   │   │   │   └── StandingsTable.tsx
│   │   │   ├── match/
│   │   │   │   ├── MatchCard.tsx
│   │   │   │   ├── ScoreEntry.tsx
│   │   │   │   └── MatchHistory.tsx
│   │   │   └── player/
│   │   │       ├── PlayerCard.tsx
│   │   │       ├── PlayerStats.tsx
│   │   │       └── RegistrationForm.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   ├── utils.ts
│   │   │   ├── validations.ts
│   │   │   └── constants.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useTournaments.ts
│   │   │   ├── useMatches.ts
│   │   │   └── useRealtime.ts
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── TournamentContext.tsx
│   │   │   └── NotificationContext.tsx
│   │   └── types/
│   │       ├── api.ts
│   │       ├── tournament.ts
│   │       ├── match.ts
│   │       └── player.ts
│   ├── tests/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   ├── public/
│   │   ├── images/
│   │   └── icons/
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── dependencies.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── api.py
│   │   │       └── endpoints/
│   │   │           ├── __init__.py
│   │   │           ├── players.py
│   │   │           ├── tournaments.py
│   │   │           ├── matches.py
│   │   │           └── registrations.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── player.py
│   │   │   ├── tournament.py
│   │   │   ├── match.py
│   │   │   ├── registration.py
│   │   │   └── base.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── player.py
│   │   │   ├── tournament.py
│   │   │   ├── match.py
│   │   │   ├── registration.py
│   │   │   └── responses.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── player.py
│   │   │   ├── tournament.py
│   │   │   ├── match.py
│   │   │   ├── bracket_generator.py
│   │   │   └── email.py
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── bracket_algorithms.py
│   │   │   ├── round_robin.py
│   │   │   ├── validators.py
│   │   │   └── helpers.py
│   │   └── middleware/
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       ├── cors.py
│   │       └── error_handlers.py
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── alembic.ini
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_api/
│   │   │   ├── __init__.py
│   │   │   ├── test_players.py
│   │   │   ├── test_tournaments.py
│   │   │   └── test_matches.py
│   │   ├── test_services/
│   │   │   ├── __init__.py
│   │   │   ├── test_player_service.py
│   │   │   └── test_tournament_service.py
│   │   └── test_utils/
│   │       ├── __init__.py
│   │       └── test_bracket_algorithms.py
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── .env.example
└── docs/
    ├── api/
    ├── deployment/
    └── development/
```

## Database Architecture

### Entity Relationship Design

#### Core Entities
1. **Player**: User accounts and profiles
2. **Tournament**: Tournament definitions and settings
3. **Registration**: Player enrollment in tournaments
4. **Match**: Individual matches within tournaments
5. **Set**: Tennis sets within matches
6. **Game**: Individual games within sets (for detailed scoring)

#### SQLAlchemy Models Structure
```python
# Base model with common fields
class BaseModel(Base):
    __abstract__ = True
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# Example entity
class Player(BaseModel):
    __tablename__ = "players"
    
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    skill_level: Mapped[SkillLevel] = mapped_column(Enum(SkillLevel))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    registrations: Mapped[List["Registration"]] = relationship(back_populates="player")
    organized_tournaments: Mapped[List["Tournament"]] = relationship(back_populates="organizer")
```

#### Relationships
- Player → Registration (1:many) - A player can register for multiple tournaments
- Tournament → Registration (1:many) - A tournament has multiple player registrations
- Tournament → Match (1:many) - A tournament contains multiple matches
- Match → Player (many:many) - A match involves two players
- Match → Set (1:many) - A match contains multiple sets
- Set → Game (1:many) - A set contains multiple games

### Database Performance Considerations
- **Indexing Strategy**: Composite indexes on (tournament_id, player_id), (tournament_id, match_date), tournament_status
- **Query Optimization**: Use of SQLAlchemy's selectinload/joinedload for eager loading relationships
- **Connection Pooling**: AsyncEngine with connection pool configuration
- **Data Archiving**: Archived tournaments using soft deletes and status-based filtering

## API Design Principles

### RESTful Endpoints
```
Players:
  POST   /api/v1/players/register          # Player registration
  GET    /api/v1/players/{id}              # Get player profile
  PUT    /api/v1/players/{id}              # Update player profile
  GET    /api/v1/players/{id}/stats        # Player statistics
  GET    /api/v1/players/{id}/history      # Match history
  GET    /api/v1/players/search            # Search players

Tournaments:
  GET    /api/v1/tournaments               # List tournaments (with filters)
  POST   /api/v1/tournaments               # Create tournament
  GET    /api/v1/tournaments/{id}          # Tournament details
  PUT    /api/v1/tournaments/{id}          # Update tournament
  POST   /api/v1/tournaments/{id}/register # Register for tournament
  POST   /api/v1/tournaments/{id}/start    # Start tournament
  GET    /api/v1/tournaments/{id}/bracket  # Tournament bracket
  GET    /api/v1/tournaments/{id}/standings # Tournament standings

Matches:
  GET    /api/v1/matches                   # List matches (with filters)
  GET    /api/v1/matches/{id}              # Match details
  PUT    /api/v1/matches/{id}/score        # Update match score
  POST   /api/v1/matches/{id}/complete     # Complete match
  GET    /api/v1/matches/{id}/stream       # Real-time match updates (SSE)

System:
  GET    /api/v1/health                    # Health check
  GET    /docs                             # Interactive API documentation
  GET    /openapi.json                     # OpenAPI specification
```

### FastAPI Features Utilized
- **Automatic OpenAPI Documentation**: Interactive docs at `/docs` and `/redoc`
- **Pydantic Models**: For request/response validation and serialization
- **Type Hints**: Full type safety throughout the application
- **Async Support**: Async database operations and real-time features
- **Dependency Injection**: For database sessions, authentication, and shared logic
- **Background Tasks**: For email notifications and async processing

## Security Architecture

### Authentication Flow
1. **Registration**: Email + password → JWT token generation
2. **Login**: Email + password validation → JWT token
3. **Authorization**: JWT token validation on protected endpoints
4. **Token Refresh**: Automatic token refresh mechanism

### Security Measures
- **Password Hashing**: bcrypt for secure password storage
- **JWT Tokens**: Short-lived access tokens with refresh mechanism
- **CORS Configuration**: Proper CORS setup for frontend integration
- **Rate Limiting**: Using slowapi for endpoint rate limiting
- **Input Validation**: Pydantic models for strict input validation
- **SQL Injection Prevention**: SQLAlchemy ORM parameterized queries

## Deployment Architecture

### Development Environment
- **Local Development**: SQLite database with uvicorn dev server
- **Docker Support**: Multi-stage Dockerfile for consistent environments
- **Database Migrations**: Alembic for version-controlled schema changes

### Production Environment
- **Application Server**: Uvicorn/Gunicorn with multiple workers
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis for session storage and caching (optional)
- **Load Balancing**: Nginx reverse proxy for static files and load balancing
- **Monitoring**: Structured logging with JSON format for log aggregation

### Scalability Considerations
- **Horizontal Scaling**: Stateless design allows multiple API instances
- **Database Scaling**: Read replicas for query-heavy operations
- **Caching Strategy**: Application-level caching for tournament standings
- **Real-time Updates**: WebSocket/SSE support for live match updates
- **Background Processing**: Celery integration for heavy computations (future enhancement)

## Testing Strategy

### Unit Testing
- **pytest**: Async test support with pytest-asyncio
- **Test Database**: Isolated SQLite database for each test
- **Fixtures**: Reusable test data fixtures with factory patterns
- **Coverage**: Code coverage reporting with pytest-cov

### Integration Testing
- **API Testing**: Full API endpoint testing with httpx async client
- **Database Testing**: Testing with actual database operations
- **Authentication Testing**: JWT token generation and validation testing

### Performance Testing
- **Load Testing**: Using locust for API performance testing
- **Database Performance**: Query optimization and N+1 problem prevention
- **Memory Profiling**: Memory usage analysis for large tournaments

## Real-time Features

### Server-Sent Events Implementation
```python
@router.get("/matches/{match_id}/stream")
async def stream_match_updates(
    match_id: str,
    db: AsyncSession = Depends(get_db)
):
    async def event_generator():
        while True:
            # Fetch latest match data
            match = await get_match_by_id(db, match_id)
            if match:
                yield f"data: {match.json()}\n\n"
            await asyncio.sleep(1)  # Update every second
    
    return StreamingResponse(
        event_generator(),
        media_type="text/plain"
    )
```

### Real-time Update Types
- **Match Score Updates**: Live score changes during matches
- **Tournament Progress**: Bracket updates and match completions
- **Player Statistics**: Real-time statistics updates
- **System Notifications**: Tournament start notifications and announcements 