# FILE: ai-service/routers/analyzer.py
# Profile analysis endpoints using Gemini AI

import os
import json
import redis.asyncio as redis

from fastapi import APIRouter, HTTPException, BackgroundTasks
from models.schemas import AnalyzeRequest
from services.platform_fetcher import fetch_all_profiles
from services.analyzer_service import analyze_profile

router = APIRouter(prefix="/analyzer", tags=["analyzer"])

# Redis client singleton for job tracking
_redis_client = None


async def _get_redis():
    """Get or create async Redis client."""
    global _redis_client
    if _redis_client is None:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        _redis_client = redis.from_url(redis_url, decode_responses=True)
    return _redis_client


@router.post("/analyze")
async def analyze(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    """
    POST /analyzer/analyze — Analyze a competitive programmer's profile.
    
    Body: { lc_username, cf_handle, cc_username }
    
    Checks Redis cache first. If not cached, fetches profiles from all
    platforms and runs AI analysis.
    """
    try:
        if not request.lc_username and not request.cf_handle and not request.cc_username:
            raise HTTPException(
                status_code=400,
                detail="At least one platform username is required"
            )

        # Check Redis cache
        cache_key = f"analysis:{request.lc_username}:{request.cf_handle}"
        try:
            redis_client = await _get_redis()
            cached = await redis_client.get(cache_key)
            if cached:
                return {
                    "analysis": json.loads(cached),
                    "cached": True,
                }
        except Exception as e:
            print(f"[Analyzer Route] Redis cache error: {e}")

        # Fetch all platform profiles concurrently
        combined_profile = await fetch_all_profiles(
            lc_username=request.lc_username,
            cf_handle=request.cf_handle,
            cc_username=request.cc_username,
        )

        # Check if we got any useful data
        has_data = any([
            combined_profile.get("leetcode"),
            combined_profile.get("codeforces"),
            combined_profile.get("codechef"),
        ])

        if not has_data:
            raise HTTPException(
                status_code=404,
                detail="Could not fetch profile data from any platform. Check usernames."
            )

        # Run AI analysis
        result = await analyze_profile(combined_profile)

        return result

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Analyzer Route] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/status/{job_id}")
async def analysis_status(job_id: str):
    """
    GET /analyzer/status/{job_id} — Check if an analysis job is complete.
    
    Returns: { status: "pending"|"complete"|"failed", result? }
    """
    try:
        redis_client = await _get_redis()

        # Check job status in Redis
        status_key = f"analysis_job:{job_id}"
        job_data = await redis_client.get(status_key)

        if not job_data:
            return {"status": "pending", "result": None}

        parsed = json.loads(job_data)
        return {
            "status": parsed.get("status", "pending"),
            "result": parsed.get("result"),
        }

    except Exception as e:
        print(f"[Analyzer Status] Error: {e}")
        return {"status": "failed", "result": None}
