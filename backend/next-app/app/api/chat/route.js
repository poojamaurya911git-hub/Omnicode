// FILE: next-app/app/api/chat/route.js
// GET /api/chat — Fetch user's chat history list
// POST /api/chat — Save new chat message to ChatHistory
// DELETE /api/chat — Delete a conversation by ID (via query param)

import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb.js';
import { authenticateUser } from '../../../lib/middleware.js';
import ChatHistory from '../../../models/ChatHistory.js';

/**
 * GET /api/chat
 * Fetch all conversations for the authenticated user
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
    // If a specific conversation ID is requested, return full messages
    const conversationId = searchParams.get('id');

    await connectDB();

    if (conversationId) {
      // Fetch single conversation with full messages
      const conversation = await ChatHistory.findOne({
        _id: conversationId,
        userId: authUser.id,
      }).lean();

      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          conversation: {
            id: conversation._id.toString(),
            title: conversation.title,
            messages: conversation.messages,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
          },
        },
        { status: 200 }
      );
    }

    // Fetch conversation list (without full messages for performance)
    const [conversations, total] = await Promise.all([
      ChatHistory.find({ userId: authUser.id })
        .select('title createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ChatHistory.countDocuments({ userId: authUser.id }),
    ]);

    return NextResponse.json(
      {
        conversations: conversations.map((c) => ({
          id: c._id.toString(),
          title: c.title,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Chat GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error fetching chat history' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat
 * Body: { conversationId?, message, role }
 * If conversationId is provided, append message to existing conversation
 * Otherwise, create a new conversation
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
    const { conversationId, message, role, title } = body;

    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    if (!role || !['user', 'assistant', 'system'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be one of: user, assistant, system' },
        { status: 400 }
      );
    }

    await connectDB();

    const messageObj = {
      role,
      content: message.trim(),
      timestamp: new Date(),
    };

    if (conversationId) {
      // Append to existing conversation
      const conversation = await ChatHistory.findOneAndUpdate(
        { _id: conversationId, userId: authUser.id },
        {
          $push: { messages: messageObj },
          $set: { updatedAt: new Date() },
        },
        { new: true }
      ).lean();

      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          conversation: {
            id: conversation._id.toString(),
            title: conversation.title,
            messageCount: conversation.messages.length,
            updatedAt: conversation.updatedAt,
          },
          message: 'Message added to conversation',
        },
        { status: 200 }
      );
    }

    // Create new conversation
    const chatTitle = title || message.trim().slice(0, 100) + (message.trim().length > 100 ? '...' : '');

    const conversation = await ChatHistory.create({
      userId: authUser.id,
      title: chatTitle,
      messages: [messageObj],
    });

    return NextResponse.json(
      {
        conversation: {
          id: conversation._id.toString(),
          title: conversation.title,
          messageCount: 1,
          createdAt: conversation.createdAt,
        },
        message: 'Conversation created',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Chat POST] Error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid conversation ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error saving chat message' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat
 * Query param: id (conversation ID)
 */
export async function DELETE(request) {
  try {
    const authUser = await authenticateUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted = await ChatHistory.findOneAndDelete({
      _id: conversationId,
      userId: authUser.id,
    }).lean();

    if (!deleted) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Conversation deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Chat DELETE] Error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid conversation ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error deleting conversation' },
      { status: 500 }
    );
  }
}
