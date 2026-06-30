// FILE: next-app/app/api/submissions/route.js
// GET /api/submissions — Fetch user's submissions (paginated, filtered)
// POST /api/submissions — Save a new submission

import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import { authenticateUser } from '../../../lib/middleware.js';
import Submission from '../../../models/Submission.js';

/**
 * GET /api/submissions
 * Query params: page, limit, verdict, platform
 */
export async function GET(request) {
  try {
    const authUser = await authenticateUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const verdict = searchParams.get('verdict') || '';
    const platform = searchParams.get('platform') || '';

    await connectDB();

    // Build filter
    const filter = { userId: authUser.id };
    if (verdict && ['AC', 'WA', 'TLE', 'MLE', 'CE', 'RE'].includes(verdict)) {
      filter.verdict = verdict;
    }
    if (platform && ['leetcode', 'codeforces', 'codechef'].includes(platform)) {
      filter.platform = platform;
    }

    // Fetch with pagination (lean for read-only)
    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .sort({ submittedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Submission.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        submissions: submissions.map((s) => ({
          id: s._id.toString(),
          problemId: s.problemId,
          problemTitle: s.problemTitle,
          platform: s.platform,
          language: s.language,
          verdict: s.verdict,
          runtime: s.runtime,
          memory: s.memory,
          submittedAt: s.submittedAt,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Submissions GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error fetching submissions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/submissions
 * Body: { problemId, problemTitle, platform, code, language, verdict, runtime, memory }
 */
export async function POST(request) {
  try {
    const authUser = await authenticateUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { problemId, problemTitle, platform, code, language, verdict, runtime, memory } = body;

    // Input validation
    if (!problemId || !problemTitle || !platform || !code || !language || !verdict) {
      return NextResponse.json(
        { error: 'Missing required fields: problemId, problemTitle, platform, code, language, verdict' },
        { status: 400 }
      );
    }

    if (!['leetcode', 'codeforces', 'codechef'].includes(platform)) {
      return NextResponse.json(
        { error: 'Platform must be one of: leetcode, codeforces, codechef' },
        { status: 400 }
      );
    }

    if (!['cpp', 'python', 'java', 'javascript'].includes(language)) {
      return NextResponse.json(
        { error: 'Language must be one of: cpp, python, java, javascript' },
        { status: 400 }
      );
    }

    if (!['AC', 'WA', 'TLE', 'MLE', 'CE', 'RE'].includes(verdict)) {
      return NextResponse.json(
        { error: 'Verdict must be one of: AC, WA, TLE, MLE, CE, RE' },
        { status: 400 }
      );
    }

    await connectDB();

    const submission = await Submission.create({
      userId: authUser.id,
      problemId,
      problemTitle,
      platform,
      code,
      language,
      verdict,
      runtime: runtime || '',
      memory: memory || '',
    });

    return NextResponse.json(
      {
        submission: {
          id: submission._id.toString(),
          problemId: submission.problemId,
          problemTitle: submission.problemTitle,
          platform: submission.platform,
          language: submission.language,
          verdict: submission.verdict,
          runtime: submission.runtime,
          memory: submission.memory,
          submittedAt: submission.submittedAt,
        },
        message: 'Submission saved successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Submissions POST] Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { error: messages.join('. ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error saving submission' },
      { status: 500 }
    );
  }
}
