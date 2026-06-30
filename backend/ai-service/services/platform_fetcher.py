# FILE: ai-service/services/platform_fetcher.py
# Normalize profile data from all competitive programming platforms

import asyncio
import httpx

# ──────────────────────────────────────────────
# LeetCode Profile Fetcher
# ──────────────────────────────────────────────

LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

LC_PROFILE_QUERY = """
query userProfile($username: String!) {
    matchedUser(username: $username) {
        username
        profile {
            ranking
            reputation
            starRating
        }
        submitStatsGlobal {
            acSubmissionNum {
                difficulty
                count
            }
        }
        tagProblemCounts {
            advanced {
                tagName
                problemsSolved
            }
            intermediate {
                tagName
                problemsSolved
            }
            fundamental {
                tagName
                problemsSolved
            }
        }
    }
}
"""

LC_RECENT_SUBMISSIONS_QUERY = """
query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
        title
        titleSlug
        timestamp
        lang
    }
}
"""


async def fetch_leetcode_profile(username):
    """
    Fetch LeetCode user profile via GraphQL.
    Returns normalized profile data.
    """
    if not username:
        return None

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Fetch profile stats
            profile_resp = await client.post(
                LEETCODE_GRAPHQL_URL,
                json={
                    "query": LC_PROFILE_QUERY,
                    "variables": {"username": username},
                },
                headers={
                    "Content-Type": "application/json",
                    "Referer": "https://leetcode.com",
                },
            )

            if profile_resp.status_code != 200:
                print(f"[LeetCode Profile] API returned {profile_resp.status_code}")
                return None

            profile_data = profile_resp.json()
            matched_user = profile_data.get("data", {}).get("matchedUser")

            if not matched_user:
                print(f"[LeetCode Profile] User '{username}' not found")
                return None

            # Parse submission stats
            submit_stats = matched_user.get("submitStatsGlobal", {}).get("acSubmissionNum", [])
            solved = {}
            total_solved = 0
            for stat in submit_stats:
                diff = stat.get("difficulty", "")
                count = stat.get("count", 0)
                if diff == "All":
                    total_solved = count
                else:
                    solved[diff.lower()] = count

            # Parse topic tags
            topics = {}
            tag_counts = matched_user.get("tagProblemCounts", {})
            for category in ["fundamental", "intermediate", "advanced"]:
                for tag_entry in tag_counts.get(category, []):
                    tag_name = tag_entry.get("tagName", "")
                    tag_count = tag_entry.get("problemsSolved", 0)
                    if tag_name and tag_count > 0:
                        topics[tag_name] = topics.get(tag_name, 0) + tag_count

            # Fetch recent submissions
            recent_resp = await client.post(
                LEETCODE_GRAPHQL_URL,
                json={
                    "query": LC_RECENT_SUBMISSIONS_QUERY,
                    "variables": {"username": username, "limit": 50},
                },
                headers={
                    "Content-Type": "application/json",
                    "Referer": "https://leetcode.com",
                },
            )

            submissions = []
            if recent_resp.status_code == 200:
                recent_data = recent_resp.json()
                raw_submissions = (
                    recent_data.get("data", {}).get("recentAcSubmissionList", [])
                )
                for s in raw_submissions:
                    submissions.append({
                        "title": s.get("title", ""),
                        "slug": s.get("titleSlug", ""),
                        "timestamp": s.get("timestamp", ""),
                        "language": s.get("lang", ""),
                    })

            ranking = (
                matched_user.get("profile", {}).get("ranking", 0) or 0
            )

            return {
                "platform": "leetcode",
                "username": username,
                "ranking": ranking,
                "solved": total_solved,
                "solvedByDifficulty": solved,
                "topics": topics,
                "submissions": submissions,
            }

    except httpx.RequestError as e:
        print(f"[LeetCode Profile] Request error: {e}")
        return None
    except Exception as e:
        print(f"[LeetCode Profile] Error: {e}")
        return None


# ──────────────────────────────────────────────
# Codeforces Profile Fetcher
# ──────────────────────────────────────────────

CF_USER_STATUS_URL = "https://codeforces.com/api/user.status"
CF_USER_RATING_URL = "https://codeforces.com/api/user.rating"
CF_USER_INFO_URL = "https://codeforces.com/api/user.info"


async def fetch_codeforces_profile(handle):
    """
    Fetch Codeforces user profile via REST API.
    Returns normalized profile data with rating history.
    """
    if not handle:
        return None

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Fetch user submissions
            status_resp = await client.get(
                CF_USER_STATUS_URL,
                params={"handle": handle, "count": 500},
            )

            if status_resp.status_code != 200:
                print(f"[Codeforces Profile] Status API returned {status_resp.status_code}")
                return None

            status_data = status_resp.json()
            if status_data.get("status") != "OK":
                print(f"[Codeforces Profile] API error: {status_data.get('comment', 'Unknown')}")
                return None

            submissions_raw = status_data.get("result", [])

            # Parse submissions for topic analysis
            topics = {}
            solved_set = set()
            submissions = []

            for sub in submissions_raw:
                if sub.get("verdict") == "OK":
                    problem = sub.get("problem", {})
                    problem_id = f"{problem.get('contestId', '')}{problem.get('index', '')}"

                    if problem_id not in solved_set:
                        solved_set.add(problem_id)
                        for tag in problem.get("tags", []):
                            topics[tag] = topics.get(tag, 0) + 1

                submissions.append({
                    "contestId": sub.get("contestId", ""),
                    "index": sub.get("problem", {}).get("index", ""),
                    "name": sub.get("problem", {}).get("name", ""),
                    "verdict": sub.get("verdict", ""),
                    "creationTimeSeconds": sub.get("creationTimeSeconds", 0),
                })

            # Fetch rating history
            rating_resp = await client.get(
                CF_USER_RATING_URL,
                params={"handle": handle},
            )

            rating_history = []
            current_rating = 0

            if rating_resp.status_code == 200:
                rating_data = rating_resp.json()
                if rating_data.get("status") == "OK":
                    for change in rating_data.get("result", []):
                        rating_history.append({
                            "contestName": change.get("contestName", ""),
                            "rank": change.get("rank", 0),
                            "oldRating": change.get("oldRating", 0),
                            "newRating": change.get("newRating", 0),
                            "ratingUpdateTimeSeconds": change.get("ratingUpdateTimeSeconds", 0),
                        })
                    if rating_history:
                        current_rating = rating_history[-1].get("newRating", 0)

            # Fetch user info for rank
            info_resp = await client.get(
                CF_USER_INFO_URL,
                params={"handles": handle},
            )

            rank = "Unrated"
            if info_resp.status_code == 200:
                info_data = info_resp.json()
                if info_data.get("status") == "OK":
                    user_list = info_data.get("result", [])
                    if user_list:
                        rank = user_list[0].get("rank", "Unrated") or "Unrated"

            return {
                "platform": "codeforces",
                "username": handle,
                "rating": current_rating,
                "rank": rank,
                "solved": len(solved_set),
                "topics": topics,
                "submissions": submissions[:100],  # Limit for payload size
                "ratingHistory": rating_history,
            }

    except httpx.RequestError as e:
        print(f"[Codeforces Profile] Request error: {e}")
        return None
    except Exception as e:
        print(f"[Codeforces Profile] Error: {e}")
        return None


# ──────────────────────────────────────────────
# CodeChef Profile Fetcher (Minimal — no public API)
# ──────────────────────────────────────────────

async def fetch_codechef_profile(username):
    """
    Fetch CodeChef user profile.
    CodeChef lacks a public API, so we return minimal data.
    """
    if not username:
        return None

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Try scraping user profile page
            response = await client.get(
                f"https://www.codechef.com/users/{username}",
                headers={"User-Agent": "OmniCode/1.0"},
                follow_redirects=True,
            )

            if response.status_code != 200:
                return {
                    "platform": "codechef",
                    "username": username,
                    "rating": 0,
                    "solved": 0,
                    "topics": {},
                    "submissions": [],
                }

            # Return basic profile — full scraping would require HTML parsing
            return {
                "platform": "codechef",
                "username": username,
                "rating": 0,
                "solved": 0,
                "topics": {},
                "submissions": [],
                "note": "CodeChef profile data is limited due to API restrictions",
            }

    except Exception as e:
        print(f"[CodeChef Profile] Error: {e}")
        return {
            "platform": "codechef",
            "username": username,
            "rating": 0,
            "solved": 0,
            "topics": {},
            "submissions": [],
        }


# ──────────────────────────────────────────────
# Combined Profile Fetcher
# ──────────────────────────────────────────────

async def fetch_all_profiles(lc_username="", cf_handle="", cc_username=""):
    """
    Run all platform fetches concurrently and merge into a single combined profile.
    """
    results = await asyncio.gather(
        fetch_leetcode_profile(lc_username),
        fetch_codeforces_profile(cf_handle),
        fetch_codechef_profile(cc_username),
        return_exceptions=True,
    )

    combined = {
        "leetcode": None,
        "codeforces": None,
        "codechef": None,
        "totalSolved": 0,
        "allTopics": {},
        "allSubmissions": [],
    }

    for i, platform_key in enumerate(["leetcode", "codeforces", "codechef"]):
        result = results[i]
        if isinstance(result, Exception):
            print(f"[Profile Fetcher] {platform_key} fetch failed: {result}")
            continue
        if result:
            combined[platform_key] = result
            combined["totalSolved"] += result.get("solved", 0)

            # Merge topics
            for topic, count in result.get("topics", {}).items():
                combined["allTopics"][topic] = combined["allTopics"].get(topic, 0) + count

            # Merge submissions
            combined["allSubmissions"].extend(result.get("submissions", []))

    return combined
