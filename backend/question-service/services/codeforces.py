# FILE: question-service/services/codeforces.py
# Codeforces problem fetcher — REST API integration with PostgreSQL upsert

import httpx
from datetime import datetime
from db.postgres import get_pool

# Codeforces API endpoints
CF_PROBLEMS_URL = "https://codeforces.com/api/problemset.problems"


async def fetch_codeforces_problems():
    """
    Fetch Codeforces problems from the REST API and upsert into PostgreSQL.
    """
    print("[Codeforces] Starting problem fetch...")
    total_upserted = 0

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(CF_PROBLEMS_URL)

            if response.status_code != 200:
                print(f"[Codeforces] API returned {response.status_code}")
                return 0

            data = response.json()

            if data.get("status") != "OK":
                print(f"[Codeforces] API error: {data.get('comment', 'Unknown')}")
                return 0

            result = data.get("result", {})
            problems = result.get("problems", [])
            problem_stats = result.get("problemStatistics", [])

            # Build stats lookup by contestId+index
            stats_map = {}
            for stat in problem_stats:
                key = f"{stat.get('contestId', '')}_{stat.get('index', '')}"
                stats_map[key] = stat

            print(f"[Codeforces] Fetched {len(problems)} problems from API")

            # Upsert into PostgreSQL
            pool = await get_pool()
            async with pool.acquire() as conn:
                for problem in problems:
                    try:
                        contest_id = problem.get("contestId", 0)
                        index = problem.get("index", "")
                        problem_id = f"{contest_id}{index}"
                        title = problem.get("name", "")
                        rating = problem.get("rating", 0) or 0
                        tags = problem.get("tags", [])
                        url = f"https://codeforces.com/problemset/problem/{contest_id}/{index}"

                        await conn.execute(
                            """
                            INSERT INTO cf_problems (id, contest_id, index, title, rating, tags, url, cached_at)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                            ON CONFLICT (id) DO UPDATE SET
                                contest_id = EXCLUDED.contest_id,
                                index = EXCLUDED.index,
                                title = EXCLUDED.title,
                                rating = EXCLUDED.rating,
                                tags = EXCLUDED.tags,
                                url = EXCLUDED.url,
                                cached_at = EXCLUDED.cached_at
                            """,
                            problem_id,
                            contest_id,
                            index,
                            title,
                            rating,
                            tags,
                            url,
                            datetime.utcnow(),
                        )
                        total_upserted += 1
                    except Exception as e:
                        print(f"[Codeforces] Upsert error for {problem.get('name', '?')}: {e}")

            print(f"[Codeforces] Upserted {total_upserted} problems")

    except httpx.RequestError as e:
        print(f"[Codeforces] Request error: {e}")
    except Exception as e:
        print(f"[Codeforces] Fatal error during fetch: {e}")

    return total_upserted
