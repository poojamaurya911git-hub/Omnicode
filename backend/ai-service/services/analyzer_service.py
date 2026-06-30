# FILE: ai-service/services/analyzer_service.py
# AI-powered competitive programming profile analyzer using Google Gemini

import os
import json
import redis.asyncio as redis
import google.generativeai as genai

# Redis client singleton
_redis_client = None


async def _get_redis():
    """Get or create async Redis client."""
    global _redis_client
    if _redis_client is None:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        _redis_client = redis.from_url(redis_url, decode_responses=True)
    return _redis_client


def _configure_gemini():
    """Configure Google Gemini API."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    genai.configure(api_key=api_key)


async def analyze_profile(combined_profile):
    """
    Analyze a competitive programmer's combined profile using Google Gemini.
    
    Args:
        combined_profile: Combined profile data from all platforms.
        
    Returns:
        Parsed analysis JSON with coaching insights.
    """
    # Check Redis cache first
    lc_username = (combined_profile.get("leetcode") or {}).get("username", "")
    cf_handle = (combined_profile.get("codeforces") or {}).get("username", "")
    cache_key = f"analysis:{lc_username}:{cf_handle}"

    try:
        redis_client = await _get_redis()
        cached = await redis_client.get(cache_key)
        if cached:
            print(f"[Analyzer] Cache hit for {cache_key}")
            return {"analysis": json.loads(cached), "cached": True}
    except Exception as e:
        print(f"[Analyzer] Redis cache check error: {e}")

    # Serialize profile to compact JSON
    # Remove large submission arrays to keep token count manageable
    profile_for_prompt = {
        "leetcode": None,
        "codeforces": None,
        "codechef": None,
        "totalSolved": combined_profile.get("totalSolved", 0),
        "allTopics": combined_profile.get("allTopics", {}),
    }

    if combined_profile.get("leetcode"):
        lc = combined_profile["leetcode"]
        profile_for_prompt["leetcode"] = {
            "username": lc.get("username"),
            "ranking": lc.get("ranking"),
            "solved": lc.get("solved"),
            "solvedByDifficulty": lc.get("solvedByDifficulty", {}),
            "topics": lc.get("topics", {}),
            "recentSubmissions": (lc.get("submissions", []))[:20],
        }

    if combined_profile.get("codeforces"):
        cf = combined_profile["codeforces"]
        profile_for_prompt["codeforces"] = {
            "username": cf.get("username"),
            "rating": cf.get("rating"),
            "rank": cf.get("rank"),
            "solved": cf.get("solved"),
            "topics": cf.get("topics", {}),
            "ratingHistory": (cf.get("ratingHistory", []))[-10:],  # Last 10 contests
        }

    if combined_profile.get("codechef"):
        cc = combined_profile["codechef"]
        profile_for_prompt["codechef"] = {
            "username": cc.get("username"),
            "rating": cc.get("rating"),
            "solved": cc.get("solved"),
        }

    json_data = json.dumps(profile_for_prompt, default=str)

    # Build Gemini prompt
    prompt = f"""You are a competitive programming coach. Given this competitive programmer's profile data:

{json_data}

Analyze their performance and return ONLY a valid JSON object with these exact keys:

- weakTopics: array of topic strings where they struggle
- strongTopics: array of topic strings where they excel
- consistencyScore: integer 0-100 based on submission frequency
- nextProblems: array of objects {{ title, platform, difficulty, url, reason }}
- summary: 2-3 sentence coaching summary
- tier: one of [Newbie, Pupil, Specialist, Expert, Candidate Master, Master]
- improvementPlan: array of 3 actionable weekly goals

Return ONLY the JSON. No markdown, no explanation, no code fences."""

    # Call Google Gemini
    try:
        _configure_gemini()
        model = genai.GenerativeModel("gemini-2.0-flash")

        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.3,
                max_output_tokens=2000,
                response_mime_type="application/json",
            ),
        )

        response_text = response.text.strip()

        # Clean up response — strip markdown fences if present
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[-1]
            if response_text.endswith("```"):
                response_text = response_text[:-3].strip()

        # Parse and validate JSON
        analysis = json.loads(response_text)

        # Validate required keys
        required_keys = [
            "weakTopics", "strongTopics", "consistencyScore",
            "nextProblems", "summary", "tier", "improvementPlan"
        ]
        for key in required_keys:
            if key not in analysis:
                analysis[key] = _get_default_value(key)

        # Validate tier
        valid_tiers = ["Newbie", "Pupil", "Specialist", "Expert", "Candidate Master", "Master"]
        if analysis.get("tier") not in valid_tiers:
            analysis["tier"] = "Newbie"

        # Validate consistencyScore range
        analysis["consistencyScore"] = max(0, min(100, int(analysis.get("consistencyScore", 0))))

        # Cache result in Redis for 24 hours (86400 seconds)
        try:
            redis_client = await _get_redis()
            await redis_client.setex(cache_key, 86400, json.dumps(analysis))
            print(f"[Analyzer] Cached result for {cache_key}")
        except Exception as e:
            print(f"[Analyzer] Redis cache set error: {e}")

        return {"analysis": analysis, "cached": False}

    except json.JSONDecodeError as e:
        print(f"[Analyzer] JSON parse error: {e}")
        print(f"[Analyzer] Raw response: {response_text[:500]}")
        return {"analysis": _get_fallback_analysis(), "cached": False}
    except Exception as e:
        print(f"[Analyzer] Gemini API error: {e}")
        raise


def _get_default_value(key):
    """Return default value for missing analysis keys."""
    defaults = {
        "weakTopics": [],
        "strongTopics": [],
        "consistencyScore": 0,
        "nextProblems": [],
        "summary": "Insufficient data for detailed analysis.",
        "tier": "Newbie",
        "improvementPlan": [],
    }
    return defaults.get(key, None)


def _get_fallback_analysis():
    """Return fallback analysis when Gemini fails."""
    return {
        "weakTopics": ["Unable to determine — try again"],
        "strongTopics": ["Unable to determine — try again"],
        "consistencyScore": 0,
        "nextProblems": [],
        "summary": "Analysis could not be completed due to an AI service error. Please try again later.",
        "tier": "Newbie",
        "improvementPlan": [
            "Solve 5 easy problems this week to build momentum",
            "Pick one new topic (e.g., binary search) and solve 3 problems",
            "Review your recent incorrect submissions and understand the mistakes",
        ],
    }
