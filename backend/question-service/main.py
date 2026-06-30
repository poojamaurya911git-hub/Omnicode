# FILE: question-service/main.py
# OmniCode Question Service — FastAPI app with scheduled problem fetching

import os
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv

from db.postgres import init_db, close_pool
from routers.problems import router as problems_router
from routers.search import router as search_router
from services.leetcode import fetch_leetcode_problems
from services.codeforces import fetch_codeforces_problems
from services.codechef import fetch_codechef_problems

# Load environment variables
load_dotenv(dotenv_path="../.env.example")

# APScheduler instance
scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan: startup and shutdown hooks.
    - Initialize PostgreSQL tables
    - Schedule periodic problem fetching
    - Trigger initial fetch on startup
    """
    print("[Question Service] Starting up...")

    # Initialize database tables
    await init_db()

    # Schedule periodic fetches
    # LeetCode: every 24 hours
    scheduler.add_job(
        fetch_leetcode_problems,
        "interval",
        hours=24,
        id="fetch_leetcode",
        name="Fetch LeetCode Problems",
        replace_existing=True,
    )

    # Codeforces: every 7 days
    scheduler.add_job(
        fetch_codeforces_problems,
        "interval",
        days=7,
        id="fetch_codeforces",
        name="Fetch Codeforces Problems",
        replace_existing=True,
    )

    # CodeChef: every 7 days
    scheduler.add_job(
        fetch_codechef_problems,
        "interval",
        days=7,
        id="fetch_codechef",
        name="Fetch CodeChef Problems",
        replace_existing=True,
    )

    # Start the scheduler
    scheduler.start()
    print("[Question Service] APScheduler started")

    # Trigger initial fetch in background (non-blocking)
    asyncio.create_task(_initial_fetch())

    yield

    # Shutdown
    print("[Question Service] Shutting down...")
    scheduler.shutdown(wait=False)
    await close_pool()
    print("[Question Service] Shutdown complete")


async def _initial_fetch():
    """Run initial problem fetch for all platforms."""
    print("[Question Service] Starting initial problem fetch...")
    try:
        results = await asyncio.gather(
            fetch_leetcode_problems(),
            fetch_codeforces_problems(),
            fetch_codechef_problems(),
            return_exceptions=True,
        )

        for i, platform in enumerate(["LeetCode", "Codeforces", "CodeChef"]):
            if isinstance(results[i], Exception):
                print(f"[Question Service] Initial {platform} fetch failed: {results[i]}")
            else:
                print(f"[Question Service] Initial {platform} fetch: {results[i]} problems")

    except Exception as e:
        print(f"[Question Service] Initial fetch error: {e}")


# ──────────────────────────────────────────────
# FastAPI app configuration
# ──────────────────────────────────────────────
app = FastAPI(
    title="OmniCode Question Service",
    description="Aggregated competitive programming problem API for LeetCode, Codeforces, and CodeChef",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — restrict to frontend origin
allowed_origin = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Include routers
app.include_router(problems_router)
app.include_router(search_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "question-service",
        "version": "1.0.0",
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "OmniCode Question Service",
        "version": "1.0.0",
        "endpoints": [
            "GET /health",
            "GET /problems?platform=&difficulty=&tag=&search=&page=&limit=",
            "GET /problems/{platform}/{id}",
            "GET /search?q=&page=&limit=",
        ],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("QUESTION_SERVICE_PORT", 8000)),
        reload=True,
        log_level="info",
    )
