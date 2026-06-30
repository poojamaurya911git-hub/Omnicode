# FILE: question-service/models/schemas.py
# Pydantic models for request/response validation

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ──────────────────────────────────────────────
# LeetCode Problem Schema
# ──────────────────────────────────────────────
class LeetCodeProblem(BaseModel):
    id: str
    title: str
    slug: str
    difficulty: str = "Medium"
    tags: list[str] = []
    acceptance_rate: float = 0.0
    url: str = ""
    cached_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# Codeforces Problem Schema
# ──────────────────────────────────────────────
class CodeforcesProblem(BaseModel):
    id: str
    contest_id: int = 0
    index: str = ""
    title: str
    rating: int = 0
    tags: list[str] = []
    url: str = ""
    cached_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# CodeChef Problem Schema
# ──────────────────────────────────────────────
class CodeChefProblem(BaseModel):
    id: str
    title: str
    code: str = ""
    difficulty: str = "medium"
    url: str = ""
    cached_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────
# Unified Problem Response
# ──────────────────────────────────────────────
class ProblemResponse(BaseModel):
    problems: list[dict]
    total: int
    page: int
    totalPages: int = Field(alias="total_pages", default=1)

    class Config:
        populate_by_name = True


# ──────────────────────────────────────────────
# Search Result
# ──────────────────────────────────────────────
class SearchResult(BaseModel):
    id: str
    title: str
    platform: str
    difficulty: str = ""
    url: str = ""


class SearchResponse(BaseModel):
    results: list[SearchResult]
    total: int
    query: str


# ──────────────────────────────────────────────
# Problem Detail Response
# ──────────────────────────────────────────────
class ProblemDetailResponse(BaseModel):
    problem: dict
    platform: str
