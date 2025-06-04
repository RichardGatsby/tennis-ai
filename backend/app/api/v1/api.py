"""Main API v1 router configuration."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, players, tournaments, matches

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(players.router, prefix="/players", tags=["Players"])
api_router.include_router(
    tournaments.router, prefix="/tournaments", tags=["Tournaments"]
)
api_router.include_router(matches.router, prefix="/matches", tags=["Matches"])
