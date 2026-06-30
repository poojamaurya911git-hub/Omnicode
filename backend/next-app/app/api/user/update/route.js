// FILE: next-app/app/api/user/update/route.js
// PUT /api/user/update — Update authenticated user's profile

import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb.js';
import { authenticateUser } from '../../../../lib/middleware.js';
import User from '../../../../models/User.js';

/**
 * Allowed fields for user profile update
 */
const ALLOWED_FIELDS = ['bio', 'lc_username', 'cf_handle', 'cc_username', 'avatar'];

export async function PUT(request) {
  try {
    // Authenticate user from JWT cookie
    const authUser = await authenticateUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Filter to only allowed fields
    const updateData = {};
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== 'string') {
          return NextResponse.json(
            { error: `Field '${field}' must be a string` },
            { status: 400 }
          );
        }
        updateData[field] = body[field].trim();
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update. Allowed: ' + ALLOWED_FIELDS.join(', ') },
        { status: 400 }
      );
    }

    // Validate bio length
    if (updateData.bio && updateData.bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio must be at most 500 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Update user and return new document
    const updatedUser = await User.findByIdAndUpdate(
      authUser.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: updatedUser._id.toString(),
          username: updatedUser.username,
          email: updatedUser.email,
          bio: updatedUser.bio || '',
          avatar: updatedUser.avatar || '',
          lc_username: updatedUser.lc_username || '',
          cf_handle: updatedUser.cf_handle || '',
          cc_username: updatedUser.cc_username || '',
          updatedAt: updatedUser.updatedAt,
        },
        message: 'Profile updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Update Profile] Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { error: messages.join('. ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error updating profile' },
      { status: 500 }
    );
  }
}
