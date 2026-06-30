// FILE: next-app/app/api/battle/leaderboard/route.js
// GET /api/battle/leaderboard — Aggregate scores from BattleRoom, sorted by score

import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import { authenticateUser } from '../../../../lib/middleware.js';
import BattleRoom from '../../../../models/BattleRoom.js';

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
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    await connectDB();

    // Aggregate scores across all battle rooms
    const leaderboard = await BattleRoom.aggregate([
      { $match: { status: 'ended' } },
      { $unwind: '$participants' },
      {
        $group: {
          _id: '$participants.userId',
          username: { $first: '$participants.username' },
          totalScore: { $sum: '$participants.score' },
          battlesPlayed: { $sum: 1 },
          totalSolved: { $sum: { $size: '$participants.solved' } },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: 1,
          totalScore: 1,
          battlesPlayed: 1,
          totalSolved: 1,
        },
      },
    ]);

    // Add rank
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
      userId: entry.userId.toString(),
    }));

    return NextResponse.json(
      {
        leaderboard: rankedLeaderboard,
        total: rankedLeaderboard.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Leaderboard] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error fetching leaderboard' },
      { status: 500 }
    );
  }
}
