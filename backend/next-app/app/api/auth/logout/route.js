// FILE: next-app/app/api/auth/logout/route.js
// POST /api/auth/logout — Clear the HttpOnly authentication cookie

import { NextResponse } from 'next/server';
import { clearAuthCookie } from '../../../../lib/jwt.js';

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    response.headers.set('Set-Cookie', clearAuthCookie());

    return response;
  } catch (error) {
    console.error('[Logout] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during logout' },
      { status: 500 }
    );
  }
}
