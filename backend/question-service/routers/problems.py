# FILE: question-service/routers/problems.py
# Problem listing and detail routes for all platforms

import math
from fastapi import APIRouter, Query, HTTPException
from db.postgres import get_pool

router = APIRouter(tags=["problems"])


@router.get("/problems")
async def list_problems(
    platform: str = Query("leetcode", description="Platform: leetcode, codeforces, codechef"),
    difficulty: str = Query("", description="Difficulty filter"),
    tag: str = Query("", description="Tag filter"),
    search: str = Query("", description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """
    GET /problems — List problems with filtering and pagination.
    Queries the correct PostgreSQL table based on platform param.
    """
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            offset = (page - 1) * limit

            if platform == "leetcode":
                problems, total = await _query_leetcode(conn, difficulty, tag, search, limit, offset)
            elif platform == "codeforces":
                problems, total = await _query_codeforces(conn, difficulty, tag, search, limit, offset)
            elif platform == "codechef":
                problems, total = await _query_codechef(conn, difficulty, search, limit, offset)
            else:
                raise HTTPException(status_code=400, detail="Platform must be one of: leetcode, codeforces, codechef")

            total_pages = math.ceil(total / limit) if total > 0 else 1

            return {
                "problems": problems,
                "total": total,
                "page": page,
                "totalPages": total_pages,
            }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Problems] Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error fetching problems")


@router.get("/problems/{platform}/{problem_id}")
async def get_problem_detail(platform: str, problem_id: str):
    """
    GET /problems/{platform}/{id} — Fetch single problem detail.
    """
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            if platform == "leetcode":
                row = await conn.fetchrow(
                    "SELECT id, title, slug, difficulty, tags, acceptance_rate, url, cached_at FROM lc_problems WHERE id = $1 OR slug = $1",
                    problem_id,
                )
                if not row:
                    raise HTTPException(status_code=404, detail="LeetCode problem not found")
                problem = {
                    "id": row["id"],
                    "title": row["title"],
                    "slug": row["slug"],
                    "difficulty": row["difficulty"],
                    "tags": row["tags"],
                    "acceptanceRate": row["acceptance_rate"],
                    "url": row["url"],
                    "cachedAt": str(row["cached_at"]) if row["cached_at"] else None,
                }

            elif platform == "codeforces":
                row = await conn.fetchrow(
                    "SELECT id, contest_id, index, title, rating, tags, url, cached_at FROM cf_problems WHERE id = $1",
                    problem_id,
                )
                if not row:
                    raise HTTPException(status_code=404, detail="Codeforces problem not found")
                problem = {
                    "id": row["id"],
                    "contestId": row["contest_id"],
                    "index": row["index"],
                    "title": row["title"],
                    "rating": row["rating"],
                    "tags": row["tags"],
                    "url": row["url"],
                    "cachedAt": str(row["cached_at"]) if row["cached_at"] else None,
                }

            elif platform == "codechef":
                row = await conn.fetchrow(
                    "SELECT id, title, code, difficulty, url, cached_at FROM cc_problems WHERE id = $1 OR code = $1",
                    problem_id,
                )
                if not row:
                    raise HTTPException(status_code=404, detail="CodeChef problem not found")
                problem = {
                    "id": row["id"],
                    "title": row["title"],
                    "code": row["code"],
                    "difficulty": row["difficulty"],
                    "url": row["url"],
                    "cachedAt": str(row["cached_at"]) if row["cached_at"] else None,
                }

            else:
                raise HTTPException(status_code=400, detail="Platform must be one of: leetcode, codeforces, codechef")

            return {"problem": problem, "platform": platform}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Problem Detail] Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error fetching problem")


# ──────────────────────────────────────────────
# Private query helpers
# ──────────────────────────────────────────────

async def _query_leetcode(conn, difficulty, tag, search, limit, offset):
    """Query lc_problems with filters."""
    conditions = []
    params = []
    param_idx = 1

    if difficulty:
        conditions.append(f"difficulty ILIKE ${param_idx}")
        params.append(difficulty)
        param_idx += 1

    if tag:
        conditions.append(f"${param_idx} = ANY(tags)")
        params.append(tag)
        param_idx += 1

    if search:
        conditions.append(f"(title ILIKE ${param_idx} OR slug ILIKE ${param_idx})")
        params.append(f"%{search}%")
        param_idx += 1

    where_clause = " AND ".join(conditions) if conditions else "TRUE"

    # Count query
    count_query = f"SELECT COUNT(*) FROM lc_problems WHERE {where_clause}"
    total = await conn.fetchval(count_query, *params)

    # Data query
    data_query = f"""
        SELECT id, title, slug, difficulty, tags, acceptance_rate, url, cached_at
        FROM lc_problems
        WHERE {where_clause}
        ORDER BY (CASE WHEN id ~ '^[0-9]+$' THEN id::int ELSE 999999 END) ASC, id ASC
        LIMIT ${param_idx} OFFSET ${param_idx + 1}
    """
    params.extend([limit, offset])
    rows = await conn.fetch(data_query, *params)

    problems = [
        {
            "id": r["id"],
            "title": r["title"],
            "slug": r["slug"],
            "difficulty": r["difficulty"],
            "tags": r["tags"],
            "acceptanceRate": r["acceptance_rate"],
            "url": r["url"],
            "platform": "leetcode",
        }
        for r in rows
    ]

    return problems, total


async def _query_codeforces(conn, difficulty, tag, search, limit, offset):
    """Query cf_problems with filters."""
    conditions = []
    params = []
    param_idx = 1

    if difficulty:
        # Map difficulty to rating ranges
        rating_ranges = {
            "easy": (0, 1200),
            "medium": (1200, 1800),
            "hard": (1800, 4000),
        }
        rating_range = rating_ranges.get(difficulty.lower())
        if rating_range:
            conditions.append(f"rating >= ${param_idx} AND rating < ${param_idx + 1}")
            params.extend(list(rating_range))
            param_idx += 2

    if tag:
        conditions.append(f"${param_idx} = ANY(tags)")
        params.append(tag)
        param_idx += 1

    if search:
        conditions.append(f"title ILIKE ${param_idx}")
        params.append(f"%{search}%")
        param_idx += 1

    where_clause = " AND ".join(conditions) if conditions else "TRUE"

    count_query = f"SELECT COUNT(*) FROM cf_problems WHERE {where_clause}"
    total = await conn.fetchval(count_query, *params)

    data_query = f"""
        SELECT id, contest_id, index, title, rating, tags, url, cached_at
        FROM cf_problems
        WHERE {where_clause}
        ORDER BY contest_id DESC, index ASC
        LIMIT ${param_idx} OFFSET ${param_idx + 1}
    """
    params.extend([limit, offset])
    rows = await conn.fetch(data_query, *params)

    problems = [
        {
            "id": r["id"],
            "contestId": r["contest_id"],
            "index": r["index"],
            "title": r["title"],
            "rating": r["rating"],
            "tags": r["tags"],
            "url": r["url"],
            "platform": "codeforces",
        }
        for r in rows
    ]

    return problems, total


async def _query_codechef(conn, difficulty, search, limit, offset):
    """Query cc_problems with filters."""
    conditions = []
    params = []
    param_idx = 1

    if difficulty:
        conditions.append(f"difficulty ILIKE ${param_idx}")
        params.append(difficulty)
        param_idx += 1

    if search:
        conditions.append(f"(title ILIKE ${param_idx} OR code ILIKE ${param_idx})")
        params.append(f"%{search}%")
        param_idx += 1

    where_clause = " AND ".join(conditions) if conditions else "TRUE"

    count_query = f"SELECT COUNT(*) FROM cc_problems WHERE {where_clause}"
    total = await conn.fetchval(count_query, *params)

    data_query = f"""
        SELECT id, title, code, difficulty, url, cached_at
        FROM cc_problems
        WHERE {where_clause}
        ORDER BY id ASC
        LIMIT ${param_idx} OFFSET ${param_idx + 1}
    """
    params.extend([limit, offset])
    rows = await conn.fetch(data_query, *params)

    problems = [
        {
            "id": r["id"],
            "title": r["title"],
            "code": r["code"],
            "difficulty": r["difficulty"],
            "url": r["url"],
            "platform": "codechef",
        }
        for r in rows
    ]

    return problems, total
