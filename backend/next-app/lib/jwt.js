// FILE: next-app/lib/jwt.js
// JWT sign and verify utilities using HttpOnly cookies

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

/**
 * Sign a JWT token with 7-day expiry
 * @param {Object} payload - Data to encode (typically { id, username, email })
 * @returns {string} Signed JWT token
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });
  } catch (error) {
    console.error('[JWT] Verification failed:', error.message);
    return null;
  }
}

/**
 * Create cookie options for setting the auth token
 * @returns {string} Set-Cookie header value
 */
export function createAuthCookie(token) {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  const sameSite = isProduction ? 'Strict' : 'Lax';

  return `omnicode_token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=${sameSite}${isProduction ? '; Secure' : ''}`;
}

/**
 * Create cookie options for clearing the auth token
 * @returns {string} Set-Cookie header value to clear cookie
 */
export function clearAuthCookie() {
  const sameSite = process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax';
  return `omnicode_token=; HttpOnly; Path=/; Max-Age=0; SameSite=${sameSite}`;
}
