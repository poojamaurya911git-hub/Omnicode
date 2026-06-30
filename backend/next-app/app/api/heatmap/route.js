// FILE: next-app/app/api/heatmap/route.js
// GET /api/heatmap — Fetch user's submissions grouped by date for activity heatmap

import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import { authenticateUser } from '../../../lib/middleware.js';
import Submission from '../../../models/Submission.js';

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
    const platform = searchParams.get('platform') || 'all';
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString(), 10);

    if (isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json(
        { error: 'Invalid year parameter' },
        { status: 400 }
      );
    }

    await connectDB();

    // Build date range for the year
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    // Build filter
    const filter = {
      userId: authUser.id,
      submittedAt: { $gte: startDate, $lt: endDate },
    };

    if (platform !== 'all' && ['leetcode', 'codeforces', 'codechef'].includes(platform)) {
      filter.platform = platform;
    }

    // Aggregate submissions by date
    const heatmapData = await Submission.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Transform to { "YYYY-MM-DD": count } format
    const dates = {};
    for (const entry of heatmapData) {
      dates[entry._id] = entry.count;
    }

    // Calculate total submissions and streak
    const totalSubmissions = Object.values(dates).reduce((sum, count) => sum + count, 0);
    const activeDays = Object.keys(dates).length;

    return NextResponse.json(
      {
        dates,
        year,
        platform,
        totalSubmissions,
        activeDays,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Heatmap] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error fetching heatmap data' },
      { status: 500 }
    );
  }
}
