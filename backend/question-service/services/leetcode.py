# FILE: question-service/services/leetcode.py
# LeetCode problem fetcher — GraphQL API integration with PostgreSQL upsert

import httpx
import asyncio
from datetime import datetime
from db.postgres import get_pool

# LeetCode GraphQL endpoint
LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

# GraphQL query for fetching problem list
PROBLEMSET_QUERY = """
query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
        categorySlug: $categorySlug
        limit: $limit
        skip: $skip
        filters: $filters
    ) {
        total: totalNum
        questions: data {
            titleSlug
            title
            difficulty
            topicTags {
                name
            }
            acRate
            frontendQuestionId: questionFrontendId
        }
    }
}
"""


async def fetch_leetcode_problems():
    """
    Fetch LeetCode problems from the GraphQL API and upsert into PostgreSQL.
    Fetches up to 2000 problems in batches.
    """
    print("[LeetCode] Starting problem fetch...")
    total_upserted = 0

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            batch_size = 100
            skip = 0
            all_problems = []

            # Fetch in batches
            while skip < 2000:
                try:
                    response = await client.post(
                        LEETCODE_GRAPHQL_URL,
                        json={
                            "query": PROBLEMSET_QUERY,
                            "variables": {
                                "categorySlug": "",
                                "limit": batch_size,
                                "skip": skip,
                                "filters": {},
                            },
                        },
                        headers={
                            "Content-Type": "application/json",
                            "Referer": "https://leetcode.com",
                        },
                    )

                    if response.status_code != 200:
                        print(f"[LeetCode] API returned {response.status_code} at skip={skip}")
                        break

                    data = response.json()
                    question_list = (
                        data.get("data", {})
                        .get("problemsetQuestionList", {})
                    )

                    if not question_list:
                        print("[LeetCode] No data in response, stopping")
                        break

                    questions = question_list.get("questions", [])
                    total_available = question_list.get("total", 0)

                    if not questions:
                        break

                    all_problems.extend(questions)
                    skip += batch_size

                    # Stop if we've fetched all available
                    if skip >= total_available:
                        break

                    # Rate limiting — be polite to LeetCode's API
                    await asyncio.sleep(1.0)

                except httpx.RequestError as e:
                    print(f"[LeetCode] Request error at skip={skip}: {e}")
                    break

            # Upsert into PostgreSQL
            if all_problems:
                pool = await get_pool()
                async with pool.acquire() as conn:
                    for q in all_problems:
                        try:
                            frontend_id = q.get("frontendQuestionId", "")
                            title = q.get("title", "")
                            slug = q.get("titleSlug", "")
                            difficulty = q.get("difficulty", "Medium")
                            tags = [t.get("name", "") for t in q.get("topicTags", [])]
                            ac_rate = float(q.get("acRate", 0.0))
                            url = f"https://leetcode.com/problems/{slug}/"

                            await conn.execute(
                                """
                                INSERT INTO lc_problems (id, title, slug, difficulty, tags, acceptance_rate, url, cached_at)
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                                ON CONFLICT (id) DO UPDATE SET
                                    title = EXCLUDED.title,
                                    slug = EXCLUDED.slug,
                                    difficulty = EXCLUDED.difficulty,
                                    tags = EXCLUDED.tags,
                                    acceptance_rate = EXCLUDED.acceptance_rate,
                                    url = EXCLUDED.url,
                                    cached_at = EXCLUDED.cached_at
                                """,
                                str(frontend_id),
                                title,
                                slug,
                                difficulty,
                                tags,
                                ac_rate,
                                url,
                                datetime.utcnow(),
                            )
                            total_upserted += 1
                        except Exception as e:
                            print(f"[LeetCode] Upsert error for {q.get('title', '?')}: {e}")

            print(f"[LeetCode] Fetched and upserted {total_upserted} problems")

    except Exception as e:
        print(f"[LeetCode] Fatal error during fetch: {e}")

    return total_upserted
