// FILE: next-app/app/api/user/profile/route.js
// GET /api/user/profile — Fetch authenticated user's full profile

import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import { authenticateUser } from '../../../../lib/middleware.js';
import User from '../../../../models/User.js';

export async function GET(request) {
  try {
    // Authenticate user from JWT cookie
    const authUser = await authenticateUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch full user profile (lean for read-only)
    const user = await User.findById(authUser.id).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate avatar fallback
    const avatarFallback = user.avatar || (() => {
      const initials = user.username
        .split(/[_-]/)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      return initials || user.username.slice(0, 2).toUpperCase();
    })();

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          bio: user.bio || '',
          avatar: user.avatar || '',
          avatarFallback,
          lc_username: user.lc_username || '',
          cf_handle: user.cf_handle || '',
          cc_username: user.cc_username || '',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Profile] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error fetching profile' },
      { status: 500 }
    );
  }
}
