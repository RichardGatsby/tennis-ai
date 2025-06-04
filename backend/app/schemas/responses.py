"""Common response schemas."""

from typing import Any, Optional, List
from pydantic import BaseModel


class BaseResponse(BaseModel):
    """Base response schema."""

    success: bool = True
    message: Optional[str] = None
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Error response schema."""

    success: bool = False
    message: str
    error_code: Optional[str] = None
    details: Optional[Any] = None


class PaginatedResponse(BaseModel):
    """Paginated response schema."""

    success: bool = True
    data: List[Any]
    total: int
    page: int
    per_page: int
    total_pages: int
