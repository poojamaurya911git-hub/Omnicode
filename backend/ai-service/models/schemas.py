# FILE: ai-service/models/schemas.py
# Pydantic models for AI service request/response validation

from pydantic import BaseModel, Field
from typing import Optional


# ──────────────────────────────────────────────
# Chat Request/Response
# ──────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str = Field(..., description="Message role: user, assistant, system")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000, description="User message")
    problemContext: Optional[str] = Field(None, description="Current problem context")
    history: list[ChatMessage] = Field(default=[], description="Conversation history")
    hintMode: bool = Field(False, description="If true, give hints instead of direct answers")


# ──────────────────────────────────────────────
# Analyzer Request/Response
# ──────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    lc_username: str = Field("", description="LeetCode username")
    cf_handle: str = Field("", description="Codeforces handle")
    cc_username: str = Field("", description="CodeChef username")


class NextProblem(BaseModel):
    title: str
    platform: str
    difficulty: str
    url: str
    reason: str


class AnalysisResult(BaseModel):
    weakTopics: list[str] = []
    strongTopics: list[str] = []
    consistencyScore: int = Field(0, ge=0, le=100)
    nextProblems: list[NextProblem] = []
    summary: str = ""
    tier: str = "Newbie"
    improvementPlan: list[str] = []


class AnalysisResponse(BaseModel):
    analysis: AnalysisResult
    cached: bool = False


class AnalysisStatusResponse(BaseModel):
    status: str = Field(..., description="pending, complete, or failed")
    result: Optional[AnalysisResult] = None


# ──────────────────────────────────────────────
# Embeddings Request
# ──────────────────────────────────────────────
class BuildIndexRequest(BaseModel):
    force: bool = Field(False, description="Force rebuild even if index exists")


class BuildIndexResponse(BaseModel):
    message: str
    status: str = "started"
