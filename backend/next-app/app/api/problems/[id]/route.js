// FILE: next-app/app/api/problems/[id]/route.js
// GET /api/problems/:id — Fetch single problem detail from question service

import { NextResponse } from 'next/server';

const QUESTION_SERVICE_URL = process.env.QUESTION_SERVICE_URL || 'http://localhost:8000';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Problem ID is required' },
        { status: 400 }
      );
    }

    // Extract platform from query params
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'leetcode';

    const response = await fetch(
      `${QUESTION_SERVICE_URL}/problems/${platform}/${id}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Problem not found' },
          { status: 404 }
        );
      }
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch problem details' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[Problem Detail] Error:', error);

    if (error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Question service request timed out' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error fetching problem' },
      { status: 500 }
    );
  }
}
