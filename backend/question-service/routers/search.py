# FILE: question-service/routers/search.py
# Full-text search across all three platform tables

from fastapi import APIRouter, Query, HTTPException
from db.postgres import get_pool

router = APIRouter(tags=["search"])


@router.get("/search")
async def search_problems(
    q: str = Query(..., min_length=1, max_length=200, description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """
    GET /search — Full-text search across all 3 platform tables using PostgreSQL ILIKE.
    Returns merged results with platform label.
    """
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            search_pattern = f"%{q}%"
            results = []

            # Search LeetCode problems
            lc_rows = await conn.fetch(
                """
                SELECT id, title, slug AS extra, difficulty, url
                FROM lc_problems
                WHERE title ILIKE $1 OR slug ILIKE $1
                ORDER BY id ASC
                LIMIT $2
                """,
                search_pattern,
                limit,
            )
            for r in lc_rows:
                results.append({
                    "id": r["id"],
                    "title": r["title"],
                    "platform": "leetcode",
                    "difficulty": r["difficulty"],
                    "url": r["url"],
                })

            # Search Codeforces problems
            cf_rows = await conn.fetch(
                """
                SELECT id, title, '' AS extra, 
                    CASE 
                        WHEN rating < 1200 THEN 'Easy'
                        WHEN rating < 1800 THEN 'Medium'
                        ELSE 'Hard'
                    END AS difficulty,
                    url
                FROM cf_problems
                WHERE title ILIKE $1
                ORDER BY contest_id DESC
                LIMIT $2
                """,
                search_pattern,
                limit,
            )
            for r in cf_rows:
                results.append({
                    "id": r["id"],
                    "title": r["title"],
                    "platform": "codeforces",
                    "difficulty": r["difficulty"],
                    "url": r["url"],
                })

            # Search CodeChef problems
            cc_rows = await conn.fetch(
                """
                SELECT id, title, code AS extra, difficulty, url
                FROM cc_problems
                WHERE title ILIKE $1 OR code ILIKE $1
                ORDER BY id ASC
                LIMIT $2
                """,
                search_pattern,
                limit,
            )
            for r in cc_rows:
                results.append({
                    "id": r["id"],
                    "title": r["title"],
                    "platform": "codechef",
                    "difficulty": r["difficulty"],
                    "url": r["url"],
                })

            # Sort merged results by relevance (exact title match first)
            results.sort(key=lambda x: (
                0 if q.lower() in x["title"].lower() else 1,
                x["platform"],
                x["title"].lower(),
            ))

            # Apply pagination to merged results
            total = len(results)
            offset = (page - 1) * limit
            paginated = results[offset:offset + limit]

            return {
                "results": paginated,
                "total": total,
                "query": q,
                "page": page,
            }

    except Exception as e:
        print(f"[Search] Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during search")
