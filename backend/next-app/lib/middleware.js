// FILE: next-app/lib/middleware.js
// Shared middleware utilities for API route protection and rate limiting

import { verifyToken } from './jwt.js';
import { redisIncr } from './redis.js';
import { cookies } from 'next/headers';

/**
 * Extract and verify user from JWT cookie
 * @param {Request} request
 * @returns {Object|null} Decoded user payload or null
 */
export async function authenticateUser(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('omnicode_token')?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('[Auth Middleware] Error:', error.message);
    return null;
  }
}

/**
 * Rate limiting middleware using Redis
 * @param {Request} request
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowSeconds - Time window in seconds
 * @returns {Object} { allowed: boolean, remaining: number, resetIn: number }
 */
export async function checkRateLimit(request, maxRequests = 5, windowSeconds = 60) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    const key = `rate_limit:${ip}:${request.url}`;

    const count = await redisIncr(key, windowSeconds);

    return {
      allowed: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetIn: windowSeconds,
    };
  } catch (error) {
    // If Redis is down, allow the request but log the error
    console.error('[Rate Limit] Redis error, allowing request:', error.message);
    return { allowed: true, remaining: maxRequests, resetIn: windowSeconds };
  }
}

/**
 * Create a standardized error response
 * @param {string} message
 * @param {number} status
 * @returns {Response}
 */
export function errorResponse(message, status = 500) {
  return Response.json(
    { error: message },
    { status }
  );
}

/**
 * Create a standardized success response
 * @param {Object} data
 * @param {number} status
 * @param {Object} headers - Additional headers
 * @returns {Response}
 */
export function successResponse(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers });
}
