"""Application configuration settings."""

import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "sqlite+aiosqlite:///./tennis_tournament.db"

    # JWT Configuration
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days

    # API Configuration
    api_v1_prefix: str = "/api/v1"
    project_name: str = "AI Tennis Tournament API"
    version: str = "1.0.0"

    # CORS Configuration
    cors_origins: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]

    # Environment
    environment: str = "development"

    # Logging
    log_level: str = "INFO"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            # Handle comma-separated string
            return [origin.strip() for origin in v.split(",")]
        return v

    class Config:
        env_file = ".env"
        case_sensitive = False


# Create global settings instance
settings = Settings()
