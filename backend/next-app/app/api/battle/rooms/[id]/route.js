// FILE: next-app/app/api/battle/rooms/[id]/route.js
// GET /api/battle/rooms/:id — Single room details
// PUT /api/battle/rooms/:id — Update room (join, start, end)
// DELETE /api/battle/rooms/:id — Delete room (host only)

import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb.js';
import { authenticateUser } from '../../../../../lib/middleware.js';
import BattleRoom from '../../../../../models/BattleRoom.js';

/**
 * GET /api/battle/rooms/:id
 */
export async function GET(request, { params }) {
  try {
    const authUser = await authenticateUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    const room = await BattleRoom.findById(id).lean();

    if (!room) {
      return NextResponse.json(
        { error: 'Battle room not found' },
        { status: 404 }
      );
    }

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
            solved: p.solved,
          })),
          problemId: room.problemId,
          difficulty: room.difficulty,
          timeLimit: room.timeLimit,
          maxParticipants: room.maxParticipants,
          status: room.status,
          startTime: room.startTime,
          endTime: room.endTime,
          createdAt: room.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Battle Room GET] Error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid room ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error fetching battle room' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/battle/rooms/:id
 * Actions: join, start, end
 * Body: { action: "join"|"start"|"end", problemId? }
 */
export async function PUT(request, { params }) {
  try {
    const authUser = await authenticateUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action, problemId } = body;

    if (!action || !['join', 'start', 'end'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be one of: join, start, end' },
        { status: 400 }
      );
    }

    await connectDB();

    const room = await BattleRoom.findById(id);

    if (!room) {
      return NextResponse.json(
        { error: 'Battle room not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'join': {
        if (room.status !== 'waiting') {
          return NextResponse.json(
            { error: 'Cannot join a room that has already started or ended' },
            { status: 400 }
          );
        }

        if (room.participants.length >= room.maxParticipants) {
          return NextResponse.json(
            { error: 'Room is full' },
            { status: 400 }
          );
        }

        const alreadyJoined = room.participants.some(
          (p) => p.userId.toString() === authUser.id
        );
        if (alreadyJoined) {
          return NextResponse.json(
            { error: 'You have already joined this room' },
            { status: 400 }
          );
        }

        room.participants.push({
          userId: authUser.id,
          username: authUser.username,
          score: 0,
          solved: [],
        });
        break;
      }

      case 'start': {
        if (room.hostId.toString() !== authUser.id) {
          return NextResponse.json(
            { error: 'Only the host can start the battle' },
            { status: 403 }
          );
        }

        if (room.status !== 'waiting') {
          return NextResponse.json(
            { error: 'Battle has already started or ended' },
            { status: 400 }
          );
        }

        room.status = 'active';
        room.startTime = new Date();
        room.endTime = new Date(Date.now() + room.timeLimit * 60 * 1000);
        if (problemId) {
          room.problemId = problemId;
        }
        break;
      }

      case 'end': {
        if (room.hostId.toString() !== authUser.id) {
          return NextResponse.json(
            { error: 'Only the host can end the battle' },
            { status: 403 }
          );
        }

        if (room.status === 'ended') {
          return NextResponse.json(
            { error: 'Battle has already ended' },
            { status: 400 }
          );
        }

        room.status = 'ended';
        room.endTime = new Date();
        break;
      }
    }

    await room.save();

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
            solved: p.solved,
          })),
          status: room.status,
          startTime: room.startTime,
          endTime: room.endTime,
        },
        message: `Room ${action} successful`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Battle Room PUT] Error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid room ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error updating battle room' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/battle/rooms/:id
 * Host only
 */
export async function DELETE(request, { params }) {
  try {
    const authUser = await authenticateUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    const room = await BattleRoom.findById(id).lean();

    if (!room) {
      return NextResponse.json(
        { error: 'Battle room not found' },
        { status: 404 }
      );
    }

    if (room.hostId.toString() !== authUser.id) {
      return NextResponse.json(
        { error: 'Only the host can delete this room' },
        { status: 403 }
      );
    }

    await BattleRoom.findByIdAndDelete(id);

    return NextResponse.json(
      { message: 'Battle room deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Battle Room DELETE] Error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid room ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error deleting battle room' },
      { status: 500 }
    );
  }
}
