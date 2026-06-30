// FILE: next-app/app/api/battle/rooms/route.js
// GET /api/battle/rooms — List all active battle rooms
// POST /api/battle/rooms — Create a new battle room

import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import { authenticateUser } from '../../../../lib/middleware.js';
import BattleRoom from '../../../../models/BattleRoom.js';

/**
 * GET /api/battle/rooms
 * List all active (waiting/active) battle rooms
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
    const status = searchParams.get('status') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    await connectDB();

    // Build filter
    const filter = {};
    if (status && ['waiting', 'active', 'ended'].includes(status)) {
      filter.status = status;
    } else {
      // Default: show waiting and active rooms
      filter.status = { $in: ['waiting', 'active'] };
    }

    const [rooms, total] = await Promise.all([
      BattleRoom.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BattleRoom.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        rooms: rooms.map((room) => ({
          id: room._id.toString(),
          name: room.name,
          hostId: room.hostId.toString(),
          participants: room.participants.map((p) => ({
            userId: p.userId.toString(),
            username: p.username,
            score: p.score,
          })),
          participantCount: room.participants.length,
          maxParticipants: room.maxParticipants,
          difficulty: room.difficulty,
          timeLimit: room.timeLimit,
          status: room.status,
          createdAt: room.createdAt,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Battle Rooms GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error fetching battle rooms' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/battle/rooms
 * Body: { name, difficulty, timeLimit, maxParticipants }
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
    const { name, difficulty, timeLimit, maxParticipants } = body;

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Difficulty must be one of: easy, medium, hard' },
        { status: 400 }
      );
    }

    if (timeLimit !== undefined) {
      const tl = parseInt(timeLimit, 10);
      if (isNaN(tl) || tl < 5 || tl > 120) {
        return NextResponse.json(
          { error: 'Time limit must be between 5 and 120 minutes' },
          { status: 400 }
        );
      }
    }

    if (maxParticipants !== undefined) {
      const mp = parseInt(maxParticipants, 10);
      if (isNaN(mp) || mp < 2 || mp > 10) {
        return NextResponse.json(
          { error: 'Max participants must be between 2 and 10' },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const room = await BattleRoom.create({
      name: name.trim(),
      hostId: authUser.id,
      participants: [
        {
          userId: authUser.id,
          username: authUser.username,
          score: 0,
          solved: [],
        },
      ],
      difficulty: difficulty || 'medium',
      timeLimit: timeLimit ? parseInt(timeLimit, 10) : 30,
      maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : 4,
      status: 'waiting',
    });

    return NextResponse.json(
      {
        room: {
          id: room._id.toString(),
          name: room.name,
          hostId: room.hostId.toString(),
          participants: room.participants.map((p) => ({
            userId: p.userId.toString(),
            username: p.username,
            score: p.score,
          })),
          difficulty: room.difficulty,
          timeLimit: room.timeLimit,
          maxParticipants: room.maxParticipants,
          status: room.status,
          createdAt: room.createdAt,
        },
        message: 'Battle room created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Battle Rooms POST] Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { error: messages.join('. ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error creating battle room' },
      { status: 500 }
    );
  }
}
