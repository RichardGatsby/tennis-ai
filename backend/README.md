# AI Tennis Tournament API

A high-performance FastAPI backend for tennis tournament management with real-time features.

## Features

- **Player Management**: Registration, authentication, and profile management
- **Tournament Management**: Create and manage tennis tournaments with different formats
- **Match Management**: Track matches, sets, and games with detailed scoring
- **Real-time Updates**: Live score updates and tournament progress
- **JWT Authentication**: Secure token-based authentication
- **Async Database**: High-performance async SQLAlchemy with PostgreSQL/SQLite support

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: Async ORM with PostgreSQL/SQLite support
- **Pydantic**: Data validation using Python type annotations
- **JWT**: JSON Web Tokens for authentication
- **Uvicorn**: ASGI server for production deployment

## Quick Start

### Prerequisites

- Python 3.11+
- pip or poetry

### Installation

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Run the application**:
   ```bash
   # Make sure you're in the backend directory
   python -m app.main
   ```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Troubleshooting

**ModuleNotFoundError: No module named 'app'**
- Make sure you're running the command from the `backend` directory
- Ensure your virtual environment is activated

**CORS Configuration Error**
- Check that CORS_ORIGINS in your .env file uses comma-separated format: `http://localhost:3000,http://localhost:3001`
- Don't use JSON array format in environment variables

## Project Structure

```
backend/
├── app/
│   ├── api/                    # API layer
│   │   ├── dependencies.py     # FastAPI dependencies
│   │   └── v1/                 # API version 1
│   │       ├── api.py          # Main API router
│   │       └── endpoints/      # API endpoints
│   │           ├── auth.py     # Authentication endpoints
│   │           ├── players.py  # Player endpoints
│   │           ├── tournaments.py # Tournament endpoints
│   │           └── matches.py  # Match endpoints
│   ├── core/                   # Core functionality
│   │   ├── config.py           # Configuration settings
│   │   ├── database.py         # Database setup
│   │   └── security.py         # Security utilities
│   ├── models/                 # SQLAlchemy models
│   │   ├── base.py             # Base model
│   │   ├── player.py           # Player model
│   │   ├── tournament.py       # Tournament model
│   │   ├── registration.py     # Registration model
│   │   ├── match.py            # Match model
│   │   ├── set.py              # Set model
│   │   └── game.py             # Game model
│   ├── schemas/                # Pydantic schemas
│   │   ├── player.py           # Player schemas
│   │   ├── tournament.py       # Tournament schemas
│   │   ├── match.py            # Match schemas
│   │   ├── registration.py     # Registration schemas
│   │   └── responses.py        # Response schemas
│   ├── services/               # Business logic
│   │   ├── player.py           # Player service
│   │   ├── tournament.py       # Tournament service
│   │   ├── match.py            # Match service
│   │   └── registration.py     # Registration service
│   └── main.py                 # FastAPI application
├── tests/                      # Test files
├── requirements.txt            # Production dependencies
├── requirements-dev.txt        # Development dependencies
├── pyproject.toml             # Project configuration
└── env.example                # Environment variables template
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new player
- `POST /api/v1/auth/login` - Login player

### Players
- `GET /api/v1/players/me` - Get current player profile
- `PUT /api/v1/players/me` - Update current player profile
- `GET /api/v1/players/{id}` - Get player by ID
- `GET /api/v1/players/` - List all players

### Tournaments
- `POST /api/v1/tournaments/` - Create tournament
- `GET /api/v1/tournaments/` - List tournaments (with filtering and search)
- `GET /api/v1/tournaments/{id}` - Get tournament details
- `PUT /api/v1/tournaments/{id}` - Update tournament (organizer only)
- `DELETE /api/v1/tournaments/{id}` - Cancel tournament (organizer only)
- `GET /api/v1/tournaments/my/organized` - Get user's organized tournaments
- `POST /api/v1/tournaments/{id}/register` - Register for tournament
- `GET /api/v1/tournaments/{id}/registrations` - Get tournament registrations (organizer only)
- `GET /api/v1/tournaments/registrations/my` - Get user's tournament registrations

### Matches
- `POST /api/v1/matches/` - Create match (tournament organizer only)
- `GET /api/v1/matches/` - List matches (with filtering)
- `GET /api/v1/matches/live` - Get live matches
- `GET /api/v1/matches/upcoming` - Get upcoming matches
- `GET /api/v1/matches/my` - Get user's matches
- `GET /api/v1/matches/{id}` - Get match details
- `PUT /api/v1/matches/{id}` - Update match (organizer only)
- `POST /api/v1/matches/{id}/status` - Update match status (start/complete/forfeit)
- `GET /api/v1/matches/tournaments/{id}` - Get matches for tournament

## Database Models

### Core Entities
- **Player**: User accounts with tennis-specific attributes
- **Tournament**: Tournament configuration and metadata
- **Registration**: Player enrollment in tournaments
- **Match**: Individual matches within tournaments
- **Set**: Tennis sets within matches
- **Game**: Individual games within sets

### Key Features
- UUID primary keys for all entities
- Automatic timestamps (created_at, updated_at)
- Comprehensive tennis scoring system
- Support for multiple tournament formats
- Detailed match and scoring history

## Development

### Running Tests
```bash
pip install -r requirements-dev.txt
pytest
```

### Code Formatting
```bash
black app/
isort app/
```

### Type Checking
```bash
mypy app/
```

### Database Migrations
```bash
# TODO: Alembic setup for database migrations
```

## Configuration

Key environment variables:

```env
# Database
DATABASE_URL=sqlite+aiosqlite:///./tennis_tournament.db

# JWT
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# API
API_V1_PREFIX=/api/v1
PROJECT_NAME=AI Tennis Tournament API

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Deployment

### Production Setup
1. Use PostgreSQL instead of SQLite
2. Set strong SECRET_KEY
3. Configure proper CORS origins
4. Use environment-specific settings
5. Set up proper logging

### Docker (Coming Soon)
```bash
# TODO: Docker setup for containerized deployment
```

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Use type hints throughout
4. Follow FastAPI best practices
5. Update documentation

## License

This project is licensed under the MIT License. 