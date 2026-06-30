// FILE: next-app/middleware.js
// Next.js root middleware — JWT guard for protected routes

import { NextResponse } from 'next/server';

/**
 * Protected route patterns that require authentication
 */
const PROTECTED_PATTERNS = [
  /^\/api\/user\//,
  /^\/api\/submissions\//,
  /^\/api\/battle\//,
  /^\/api\/heatmap/,
  /^\/api\/chat/,
];

/**
 * Rate-limited route patterns
 */
const RATE_LIMITED_PATTERNS = [
  /^\/api\/auth\//,
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtected = PROTECTED_PATTERNS.some((pattern) => pattern.test(pathname));

  if (isProtected) {
    const token = request.cookies.get('omnicode_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Decode JWT payload without full verification (verification happens in route handlers)
    // This is a fast check — full verification with secret happens in the API route
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }

      const payload = JSON.parse(atob(payloadBase64));

      // Check expiry
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        const response = NextResponse.json(
          { error: 'Token expired. Please log in again.' },
          { status: 401 }
        );
        response.cookies.delete('omnicode_token');
        return response;
      }

      // Attach user ID to request headers for downstream route handlers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.id);
      requestHeaders.set('x-user-username', payload.username || '');
      requestHeaders.set('x-user-email', payload.email || '');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

/**
 * Configure which paths the middleware runs on
 */
export const config = {
  matcher: [
    '/api/user/:path*',
    '/api/submissions/:path*',
    '/api/battle/:path*',
    '/api/heatmap/:path*',
    '/api/chat/:path*',
    '/api/auth/:path*',
  ],
};
