// FILE: next-app/app/api/problems/route.js
// GET /api/problems — Proxy to question service for problem listing

import { NextResponse } from 'next/server';

const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || 'http://localhost:8000';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'leetcode';
    const difficulty = searchParams.get('difficulty') || '';
    const tag = searchParams.get('tag') || '';
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    // Build query string for question service
    const params = new URLSearchParams();
    params.set('platform', platform);
    if (difficulty) params.set('difficulty', difficulty);
    if (tag) params.set('tag', tag);
    if (search) params.set('search', search);
    params.set('page', page);
    params.set('limit', limit);

    const response = await fetch(
      `${QUESTION_SERVICE_URL}/problems?${params.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000), // 10s timeout
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch problems from question service' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[Problems] Error:', error);

    if (error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Question service request timed out' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error fetching problems' },
      { status: 500 }
    );
  }
}
