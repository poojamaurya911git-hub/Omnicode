# FILE: question-service/db/postgres.py
# asyncpg connection pool and table initialization for PostgreSQL

import os
import asyncpg
from contextlib import asynccontextmanager

# Connection pool singleton
_pool = None


async def get_pool():
    """Get or create the asyncpg connection pool."""
    global _pool
    if _pool is None:
        postgres_url = os.getenv("POSTGRES_URL", "postgresql://user:pass@localhost:5432/omnicode")
        _pool = await asyncpg.create_pool(
            dsn=postgres_url,
            min_size=2,
            max_size=10,
            command_timeout=30,
        )
        print("[PostgreSQL] Connection pool created")
    return _pool


async def close_pool():
    """Close the connection pool."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
        print("[PostgreSQL] Connection pool closed")


async def init_db():
    """Create tables if they don't exist."""
    pool = await get_pool()

    async with pool.acquire() as conn:
        # LeetCode problems table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS lc_problems (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                slug TEXT NOT NULL,
                difficulty TEXT NOT NULL DEFAULT 'Medium',
                tags TEXT[] DEFAULT '{}',
                acceptance_rate REAL DEFAULT 0.0,
                url TEXT NOT NULL DEFAULT '',
                cached_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)

        # Codeforces problems table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS cf_problems (
                id TEXT PRIMARY KEY,
                contest_id INTEGER NOT NULL DEFAULT 0,
                index TEXT NOT NULL DEFAULT '',
                title TEXT NOT NULL,
                rating INTEGER DEFAULT 0,
                tags TEXT[] DEFAULT '{}',
                url TEXT NOT NULL DEFAULT '',
                cached_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)

        # CodeChef problems table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS cc_problems (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                code TEXT NOT NULL DEFAULT '',
                difficulty TEXT NOT NULL DEFAULT 'medium',
                url TEXT NOT NULL DEFAULT '',
                cached_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)

        # Create indexes for full-text search
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_lc_title ON lc_problems (title);
        """)
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_lc_slug ON lc_problems (slug);
        """)
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_cf_title ON cf_problems (title);
        """)
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_cc_title ON cc_problems (title);
        """)
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_lc_difficulty ON lc_problems (difficulty);
        """)
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_cf_rating ON cf_problems (rating);
        """)
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_cc_difficulty ON cc_problems (difficulty);
        """)

    print("[PostgreSQL] Tables initialized successfully")


@asynccontextmanager
async def get_connection():
    """Context manager for getting a connection from the pool."""
    pool = await get_pool()
    conn = await pool.acquire()
    try:
        yield conn
    finally:
        await pool.release(conn)
