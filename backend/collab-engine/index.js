// FILE: collab-engine/index.js
// Standalone Node.js server on port 4000 — Socket.io + Yjs + JDoodle
// Entry point for the OmniCode collaborative coding engine

import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { initRedis, registerSocketHandlers } from './roomManager.js';
import { execute } from './jdoodleClient.js';

dotenv.config({ path: '../.env.example' });

const PORT = process.env.COLLAB_ENGINE_PORT || 4000;
const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Create HTTP server
 */
const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'collab-engine', uptime: process.uptime() }));
    return;
  }

  // HTTP execute endpoint (used by Next.js API proxy)
  if (req.method === 'POST' && req.url === '/execute') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();

      // Limit body size to 1MB
      if (body.length > 1024 * 1024) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request body too large' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const { code, language, stdin } = JSON.parse(body);

        if (!code || !language) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'code and language are required' }));
          return;
        }

        const result = await execute({ code, language, stdin: stdin || '' });

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          'Access-Control-Allow-Credentials': 'true',
        });
        res.end(JSON.stringify(result));
      } catch (error) {
        console.error('[HTTP Execute] Error:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error during execution' }));
      }
    });

    return;
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return;
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

/**
 * Attach Socket.io with CORS configured for frontend origin
 */
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 1MB max message size
});

/**
 * Socket.io connection handler
 */
io.on('connection', (socket) => {
  console.log(`[Collab Engine] Client connected: ${socket.id}`);

  // Register all room/Yjs/execution event handlers
  registerSocketHandlers(io, socket);

  // Log disconnection
  socket.on('disconnect', (reason) => {
    console.log(`[Collab Engine] Client disconnected: ${socket.id} (${reason})`);
  });
});

/**
 * Graceful shutdown handler
 */
function gracefulShutdown(signal) {
  console.log(`\n[Collab Engine] Received ${signal}, shutting down gracefully...`);
  io.close(() => {
    console.log('[Collab Engine] Socket.io server closed');
    httpServer.close(() => {
      console.log('[Collab Engine] HTTP server closed');
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('[Collab Engine] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Start the server
 */
async function start() {
  try {
    // Initialize Redis connection for Yjs state persistence
    await initRedis();
    console.log('[Collab Engine] Redis initialized for Yjs state persistence');

    httpServer.listen(PORT, () => {
      console.log(`[Collab Engine] Server running on port ${PORT}`);
      console.log(`[Collab Engine] CORS origin: ${ALLOWED_ORIGIN}`);
      console.log(`[Collab Engine] Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('[Collab Engine] Failed to start:', error.message);

    // Start without Redis (degraded mode — no state persistence)
    console.warn('[Collab Engine] Starting in degraded mode (no Redis state persistence)');
    httpServer.listen(PORT, () => {
      console.log(`[Collab Engine] Server running on port ${PORT} (degraded mode)`);
    });
  }
}

start();
