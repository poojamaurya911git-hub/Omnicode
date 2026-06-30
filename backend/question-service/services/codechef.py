# FILE: question-service/services/codechef.py
# CodeChef problem fetcher — API integration with fallback mock data

import httpx
from datetime import datetime
from db.postgres import get_pool

# CodeChef API endpoint
CC_API_URL = "https://www.codechef.com/api/list/problems"


async def fetch_codechef_problems():
    """
    Fetch CodeChef problems from the API or use fallback mock data.
    CodeChef's API can be unreliable, so we include comprehensive fallback data.
    """
    print("[CodeChef] Starting problem fetch...")
    total_upserted = 0
    problems = []

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Try fetching from CodeChef API
            for difficulty in ["school", "easy", "medium", "hard", "challenge"]:
                try:
                    response = await client.get(
                        CC_API_URL,
                        params={
                            "sort_by": "difficulty_rating",
                            "sort_order": "asc",
                            "page": 0,
                            "limit": 200,
                            "category": difficulty,
                        },
                        headers={
                            "User-Agent": "OmniCode/1.0",
                        },
                    )

                    if response.status_code == 200:
                        data = response.json()
                        raw_problems = data.get("data", [])

                        if isinstance(raw_problems, list):
                            for p in raw_problems:
                                problems.append({
                                    "code": p.get("code", ""),
                                    "title": p.get("name", p.get("title", "")),
                                    "difficulty": difficulty,
                                    "url": f"https://www.codechef.com/problems/{p.get('code', '')}",
                                })
                    else:
                        print(f"[CodeChef] API returned {response.status_code} for {difficulty}")

                except httpx.RequestError as e:
                    print(f"[CodeChef] Request error for {difficulty}: {e}")

    except Exception as e:
        print(f"[CodeChef] API fetch failed: {e}")

    # Fallback mock data if API returned nothing
    if not problems:
        print("[CodeChef] Using fallback mock data")
        problems = _get_fallback_problems()

    # Upsert into PostgreSQL
    if problems:
        pool = await get_pool()
        async with pool.acquire() as conn:
            for p in problems:
                try:
                    problem_code = p.get("code", "")
                    if not problem_code:
                        continue

                    await conn.execute(
                        """
                        INSERT INTO cc_problems (id, title, code, difficulty, url, cached_at)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT (id) DO UPDATE SET
                            title = EXCLUDED.title,
                            code = EXCLUDED.code,
                            difficulty = EXCLUDED.difficulty,
                            url = EXCLUDED.url,
                            cached_at = EXCLUDED.cached_at
                        """,
                        problem_code,
                        p.get("title", ""),
                        problem_code,
                        p.get("difficulty", "medium"),
                        p.get("url", f"https://www.codechef.com/problems/{problem_code}"),
                        datetime.utcnow(),
                    )
                    total_upserted += 1
                except Exception as e:
                    print(f"[CodeChef] Upsert error for {p.get('code', '?')}: {e}")

    print(f"[CodeChef] Upserted {total_upserted} problems")
    return total_upserted


def _get_fallback_problems():
    """Fallback mock data when CodeChef API is unavailable."""
    return [
        {"code": "FLOW001", "title": "Add Two Numbers", "difficulty": "school", "url": "https://www.codechef.com/problems/FLOW001"},
        {"code": "FLOW002", "title": "ID and Ship", "difficulty": "school", "url": "https://www.codechef.com/problems/FLOW002"},
        {"code": "FLOW003", "title": "Sum of Digits", "difficulty": "school", "url": "https://www.codechef.com/problems/FLOW003"},
        {"code": "FLOW004", "title": "First and Last Digit", "difficulty": "school", "url": "https://www.codechef.com/problems/FLOW004"},
        {"code": "FLOW005", "title": "Smallest and Largest", "difficulty": "school", "url": "https://www.codechef.com/problems/FLOW005"},
        {"code": "FLOW006", "title": "Leap Year", "difficulty": "school", "url": "https://www.codechef.com/problems/FLOW006"},
        {"code": "FLOW007", "title": "Reverse The Number", "difficulty": "school", "url": "https://www.codechef.com/problems/FLOW007"},
        {"code": "FLOW008", "title": "Palindrome", "difficulty": "school", "url": "https://www.codechef.com/problems/FLOW008"},
        {"code": "INTEST", "title": "Enormous Input Test", "difficulty": "easy", "url": "https://www.codechef.com/problems/INTEST"},
        {"code": "FCTRL", "title": "Factorial", "difficulty": "easy", "url": "https://www.codechef.com/problems/FCTRL"},
        {"code": "TSORT", "title": "Turbo Sort", "difficulty": "easy", "url": "https://www.codechef.com/problems/TSORT"},
        {"code": "LAPIN", "title": "Lapindrome", "difficulty": "easy", "url": "https://www.codechef.com/problems/LAPIN"},
        {"code": "SUMTRIAN", "title": "Sums in a Triangle", "difficulty": "easy", "url": "https://www.codechef.com/problems/SUMTRIAN"},
        {"code": "MARCHA1", "title": "Cleaning Up", "difficulty": "medium", "url": "https://www.codechef.com/problems/MARCHA1"},
        {"code": "MAXDIFF", "title": "Maximum Weight Difference", "difficulty": "medium", "url": "https://www.codechef.com/problems/MAXDIFF"},
        {"code": "TACHSTCK", "title": "Chopsticks", "difficulty": "medium", "url": "https://www.codechef.com/problems/TACHSTCK"},
        {"code": "CIELRCPT", "title": "Ciel and Receipt", "difficulty": "medium", "url": "https://www.codechef.com/problems/CIELRCPT"},
        {"code": "KGOLD", "title": "Gold Coins", "difficulty": "medium", "url": "https://www.codechef.com/problems/KGOLD"},
        {"code": "ACM14KP1", "title": "Consecutive Subsequences", "difficulty": "hard", "url": "https://www.codechef.com/problems/ACM14KP1"},
        {"code": "QSTRING", "title": "Beautiful Strings", "difficulty": "hard", "url": "https://www.codechef.com/problems/QSTRING"},
        {"code": "SEAGM", "title": "Sereja and Game", "difficulty": "hard", "url": "https://www.codechef.com/problems/SEAGM"},
        {"code": "LEMUSIC", "title": "Little Elephant and Music", "difficulty": "hard", "url": "https://www.codechef.com/problems/LEMUSIC"},
        {"code": "PRPOTION", "title": "Potions", "difficulty": "hard", "url": "https://www.codechef.com/problems/PRPOTION"},
    ]
