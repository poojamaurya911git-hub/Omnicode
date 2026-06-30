// FILE: next-app/lib/redis.js
// Redis client with connection caching for session cache, Yjs state, and rate limiting

import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let cached = global.redis;

if (!cached) {
  cached = global.redis = { client: null, promise: null };
}

/**
 * Get or create a Redis client with connection caching
 * @returns {Promise<import('redis').RedisClientType>}
 */
export async function getRedisClient() {
  if (cached.client && cached.client.isOpen) {
    return cached.client;
  }

  if (!cached.promise) {
    const client = createClient({
      url: REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('[Redis] Max reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    client.on('error', (err) => {
      console.error('[Redis] Client error:', err.message);
    });

    client.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });

    cached.promise = client.connect().then(() => {
      cached.client = client;
      return client;
    });
  }

  try {
    cached.client = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('[Redis] Connection failed:', error.message);
    throw error;
  }

  return cached.client;
}

/**
 * Set a value in Redis with mandatory TTL
 * @param {string} key
 * @param {string} value
 * @param {number} ttlSeconds - Time to live in seconds (required)
 */
export async function redisSet(key, value, ttlSeconds) {
  if (!ttlSeconds || ttlSeconds <= 0) {
    throw new Error('Redis TTL is required and must be positive');
  }
  const client = await getRedisClient();
  await client.setEx(key, ttlSeconds, value);
}

/**
 * Get a value from Redis
 * @param {string} key
 * @returns {Promise<string|null>}
 */
export async function redisGet(key) {
  const client = await getRedisClient();
  return client.get(key);
}

/**
 * Delete a key from Redis
 * @param {string} key
 */
export async function redisDel(key) {
  const client = await getRedisClient();
  return client.del(key);
}

/**
 * Increment a key in Redis (for rate limiting)
 * @param {string} key
 * @param {number} ttlSeconds
 * @returns {Promise<number>} Current count
 */
export async function redisIncr(key, ttlSeconds) {
  const client = await getRedisClient();
  const count = await client.incr(key);
  if (count === 1) {
    await client.expire(key, ttlSeconds);
  }
  return count;
}

export default getRedisClient;
