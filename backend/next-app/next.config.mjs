// FILE: next-app/next.config.mjs
// Next.js configuration for API-only backend

// Fix: Force Google DNS for MongoDB Atlas SRV record resolution
// Node.js v24 on some systems can't resolve SRV records with default DNS
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode for better development practices
  reactStrictMode: true,

  // Environment variables validation
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    REDIS_URL: process.env.REDIS_URL,
    COLLAB_ENGINE_URL: process.env.COLLAB_ENGINE_URL,
    QUESTION_SERVICE_URL: process.env.QUESTION_SERVICE_URL,
    AI_SERVICE_URL: process.env.AI_SERVICE_URL,
  },

  // Disable image optimization (API-only backend)
  images: {
    unoptimized: true,
  },

  // CORS headers for API routes
  async headers() {
    const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: allowedOrigin },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ];
  },

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
