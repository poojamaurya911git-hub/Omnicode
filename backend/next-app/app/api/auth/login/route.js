// FILE: next-app/app/api/auth/login/route.js
// POST /api/auth/login — User login with bcrypt comparison + JWT

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '../../../../lib/mongodb.js';
import { signToken, createAuthCookie } from '../../../../lib/jwt.js';
import { checkRateLimit } from '../../../../lib/middleware.js';
import User from '../../../../models/User.js';

export async function POST(request) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const rateLimit = await checkRateLimit(request, 5, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'Retry-After': String(rateLimit.resetIn),
          },
        }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user by email (explicitly select password field)
    const user = await User.findOne({ email: email.trim().toLowerCase() })
      .select('+password')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Sign JWT
    const token = signToken({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    });

    // Set HttpOnly cookie and return response
    const response = NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
        },
        message: 'Login successful',
      },
      { status: 200 }
    );

    response.headers.set('Set-Cookie', createAuthCookie(token));

    return response;
  } catch (error) {
    console.error('[Login] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
