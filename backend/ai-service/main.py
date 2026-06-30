# FILE: ai-service/main.py
# OmniCode AI Service — FastAPI app for AI coaching, profile analysis, and RAG

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers.chat import router as chat_router
from routers.analyzer import router as analyzer_router
from routers.embeddings import router as embeddings_router

# Load environment variables
load_dotenv(dotenv_path="../.env.example")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan: startup and shutdown hooks.
    - Validate required environment variables
    - Initialize connections
    """
    print("[AI Service] Starting up...")

    # Validate required environment variables
    required_vars = ["GEMINI_API_KEY"]
    optional_vars = ["PINECONE_API_KEY", "PINECONE_INDEX", "REDIS_URL"]

    for var in required_vars:
        if not os.getenv(var):
            print(f"[AI Service] WARNING: Required env var {var} is not set")

    for var in optional_vars:
        if not os.getenv(var):
            print(f"[AI Service] INFO: Optional env var {var} is not set (some features may be limited)")

    print("[AI Service] Startup complete")

    yield

    # Shutdown
    print("[AI Service] Shutting down...")

    # Close Redis connections if any
    try:
        from services.analyzer_service import _get_redis as get_analyzer_redis
        redis_client = await get_analyzer_redis()
        if redis_client:
            await redis_client.close()
            print("[AI Service] Analyzer Redis connection closed")
    except Exception as e:
        print(f"[AI Service] Redis cleanup error: {e}")

    try:
        from routers.analyzer import _get_redis as get_router_redis
        redis_client = await get_router_redis()
        if redis_client:
            await redis_client.close()
            print("[AI Service] Router Redis connection closed")
    except Exception:
        pass

    print("[AI Service] Shutdown complete")


# ──────────────────────────────────────────────
# FastAPI app configuration
# ──────────────────────────────────────────────
app = FastAPI(
    title="OmniCode AI Service",
    description="AI-powered competitive programming coach with RAG, profile analysis, and real-time coaching",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — restrict to frontend origin only, not wildcard
allowed_origin = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Include routers
app.include_router(chat_router)
app.include_router(analyzer_router)
app.include_router(embeddings_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    gemini_configured = bool(os.getenv("GEMINI_API_KEY"))
    pinecone_configured = bool(os.getenv("PINECONE_API_KEY"))
    redis_configured = bool(os.getenv("REDIS_URL"))

    return {
        "status": "ok",
        "service": "ai-service",
        "version": "1.0.0",
        "integrations": {
            "gemini": "configured" if gemini_configured else "missing",
            "pinecone": "configured" if pinecone_configured else "missing",
            "redis": "configured" if redis_configured else "missing",
        },
    }


@app.get("/")
async def root():
    """Root endpoint with API documentation."""
    return {
        "service": "OmniCode AI Service",
        "version": "1.0.0",
        "endpoints": [
            "GET  /health",
            "POST /chat",
            "POST /analyzer/analyze",
            "GET  /analyzer/status/{job_id}",
            "POST /embeddings/build",
        ],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("AI_SERVICE_PORT", 8001)),
        reload=True,
        log_level="info",
    )
