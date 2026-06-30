// FILE: collab-engine/roomManager.js
// Yjs CRDT room manager with Redis persistence and Socket.io integration

import * as Y from 'yjs';
import { createClient } from 'redis';
import { execute } from './jdoodleClient.js';

/**
 * Room structure: Map<roomId, { ydoc, participants: Set, language, problemId }>
 */
const rooms = new Map();

let redisClient = null;

/**
 * Initialize Redis client for Yjs state persistence
 */
export async function initRedis() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  redisClient = createClient({ url: redisUrl });

  redisClient.on('error', (err) => {
    console.error('[RoomManager Redis] Error:', err.message);
  });

  redisClient.on('connect', () => {
    console.log('[RoomManager Redis] Connected');
  });

  await redisClient.connect();
  return redisClient;
}

/**
 * Get or create a room
 * @param {string} roomId
 * @returns {Object} Room object
 */
function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      ydoc: new Y.Doc(),
      participants: new Map(), // Map<socketId, { userId, username }>
      language: 'javascript',
      problemId: '',
    });
  }
  return rooms.get(roomId);
}

/**
 * Restore Yjs state from Redis
 * @param {string} roomId
 * @param {Y.Doc} ydoc
 */
async function restoreYjsState(roomId, ydoc) {
  if (!redisClient || !redisClient.isOpen) return;

  try {
    const savedState = await redisClient.get(`room:${roomId}:ydoc`);
    if (savedState) {
      const update = Buffer.from(savedState, 'base64');
      Y.applyUpdate(ydoc, update);
      console.log(`[RoomManager] Restored Yjs state for room ${roomId}`);
    }
  } catch (error) {
    console.error(`[RoomManager] Failed to restore state for room ${roomId}:`, error.message);
  }
}

/**
 * Persist Yjs state to Redis
 * @param {string} roomId
 * @param {Y.Doc} ydoc
 */
async function persistYjsState(roomId, ydoc) {
  if (!redisClient || !redisClient.isOpen) return;

  try {
    const state = Y.encodeStateAsUpdate(ydoc);
    const encoded = Buffer.from(state).toString('base64');
    // TTL: 1 hour (3600 seconds) — never store without expiry
    await redisClient.setEx(`room:${roomId}:ydoc`, 3600, encoded);
  } catch (error) {
    console.error(`[RoomManager] Failed to persist state for room ${roomId}:`, error.message);
  }
}

/**
 * Get participants list for a room
 * @param {string} roomId
 * @returns {Array} Participant objects
 */
function getParticipantsList(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.participants.values());
}

/**
 * Find which room a socket is in
 * @param {string} socketId
 * @returns {string|null} Room ID or null
 */
function findRoomBySocket(socketId) {
  for (const [roomId, room] of rooms.entries()) {
    if (room.participants.has(socketId)) {
      return roomId;
    }
  }
  return null;
}

/**
 * Register all Socket.io event handlers for a socket
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
export function registerSocketHandlers(io, socket) {
  /**
   * join-room: Join or create a collaborative room
   */
  socket.on('join-room', async ({ roomId, userId, username }) => {
    if (!roomId || !userId || !username) {
      socket.emit('error', { message: 'roomId, userId, and username are required' });
      return;
    }

    try {
      const room = getOrCreateRoom(roomId);

      // Add participant
      room.participants.set(socket.id, { userId, username });
      socket.join(roomId);

      // Restore Yjs state from Redis if this is a new room
      if (room.participants.size === 1) {
        await restoreYjsState(roomId, room.ydoc);
      }

      // Send current state to the joining participant
      const currentState = Y.encodeStateAsUpdate(room.ydoc);
      socket.emit('yjs-sync', {
        update: Buffer.from(currentState).toString('base64'),
      });

      // Emit room-joined with current participants list
      io.to(roomId).emit('room-joined', {
        roomId,
        participants: getParticipantsList(roomId),
        language: room.language,
        problemId: room.problemId,
      });

      console.log(`[RoomManager] ${username} joined room ${roomId} (${room.participants.size} participants)`);
    } catch (error) {
      console.error('[RoomManager] join-room error:', error.message);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  /**
   * yjs-update: Apply and broadcast Yjs document update
   */
  socket.on('yjs-update', async ({ roomId, update }) => {
    if (!roomId || !update) return;

    const room = rooms.get(roomId);
    if (!room) return;

    try {
      const updateBuffer = Buffer.from(update, 'base64');
      Y.applyUpdate(room.ydoc, updateBuffer);

      // Persist to Redis with TTL
      await persistYjsState(roomId, room.ydoc);

      // Broadcast to all other participants in the room
      socket.to(roomId).emit('yjs-update', { roomId, update });
    } catch (error) {
      console.error('[RoomManager] yjs-update error:', error.message);
    }
  });

  /**
   * awareness-update: Broadcast cursor/selection sync
   */
  socket.on('awareness-update', ({ roomId, update }) => {
    if (!roomId || !update) return;

    // Broadcast to all others in room (cursor/selection sync)
    socket.to(roomId).emit('awareness-update', { roomId, update });
  });

  /**
   * language-change: Update and broadcast language change
   */
  socket.on('language-change', ({ roomId, language }) => {
    if (!roomId || !language) return;

    const room = rooms.get(roomId);
    if (!room) return;

    room.language = language;

    // Broadcast to all in room
    io.to(roomId).emit('language-change', { roomId, language });
    console.log(`[RoomManager] Language changed to ${language} in room ${roomId}`);
  });

  /**
   * execute-code: Execute code via JDoodle and return result to all participants
   */
  socket.on('execute-code', async ({ roomId, code, language, stdin }) => {
    if (!roomId || !code || !language) {
      socket.emit('error', { message: 'roomId, code, and language are required for execution' });
      return;
    }

    try {
      // Emit executing status
      io.to(roomId).emit('execution-status', { status: 'executing', roomId });

      const result = await execute({ code, language, stdin: stdin || '' });

      // Emit execution result to all in room
      io.to(roomId).emit('execution-result', {
        roomId,
        result: {
          stdout: result.stdout,
          stderr: result.stderr,
          status: result.status,
          cpuTime: result.cpuTime,
          memory: result.memory,
        },
      });
    } catch (error) {
      console.error('[RoomManager] execute-code error:', error.message);
      io.to(roomId).emit('execution-result', {
        roomId,
        result: {
          stdout: '',
          stderr: `Execution error: ${error.message}`,
          status: 'error',
          cpuTime: '',
          memory: '',
        },
      });
    }
  });

  /**
   * disconnect: Clean up participant from all rooms
   */
  socket.on('disconnect', () => {
    const roomId = findRoomBySocket(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    room.participants.delete(socket.id);

    if (participant) {
      console.log(`[RoomManager] ${participant.username} left room ${roomId} (${room.participants.size} remaining)`);
    }

    // Notify remaining participants
    io.to(roomId).emit('participant-left', {
      roomId,
      participants: getParticipantsList(roomId),
      leftUser: participant || { userId: 'unknown', username: 'unknown' },
    });

    // Clean up empty rooms (but keep Yjs state in Redis for reconnection)
    if (room.participants.size === 0) {
      rooms.delete(roomId);
      console.log(`[RoomManager] Room ${roomId} cleaned up (no participants)`);
    }
  });
}

export default { initRedis, registerSocketHandlers };
