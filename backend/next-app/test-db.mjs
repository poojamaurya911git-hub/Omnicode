// FILE: test-db.mjs
// Quick MongoDB connection test — run with: node test-db.mjs
// This script connects to MongoDB, lists collections, and creates a test document

import mongoose from 'mongoose';
import dns from 'dns';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Fix: Force Google DNS for SRV record resolution
// Node.js v24 on some systems can't resolve MongoDB SRV records with default DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Manually load .env (no dotenv dependency needed)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '.env');

try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch (err) {
  console.error('❌ Cannot read .env file at:', envPath);
  console.error('   Make sure backend/next-app/.env exists');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  console.error('   Please set it in backend/next-app/.env');
  process.exit(1);
}

// Mask the password in the URI for safe logging
const maskedUri = MONGODB_URI.replace(
  /\/\/([^:]+):([^@]+)@/,
  '//$1:****@'
);

console.log('');
console.log('🔗 Connecting to MongoDB...');
console.log(`   URI: ${maskedUri}`);
console.log('');

async function testConnection() {
  try {
    // Step 1: Connect
    const startTime = Date.now();
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });
    const connectTime = Date.now() - startTime;

    console.log(`✅ Connected successfully! (${connectTime}ms)`);
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}`);
    console.log('');

    // Step 2: List existing collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    if (collections.length > 0) {
      console.log(`📂 Existing collections (${collections.length}):`);
      for (const col of collections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`   - ${col.name} (${count} documents)`);
      }
    } else {
      console.log('📂 No collections yet (empty database — this is normal for first setup)');
    }
    console.log('');

    // Step 3: Test write + read + delete
    console.log('🧪 Testing write/read/delete...');
    const testCollection = mongoose.connection.db.collection('_connection_test');

    const testDoc = {
      test: true,
      message: 'OmniCode MongoDB connection test',
      timestamp: new Date(),
    };

    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`   ✅ Write: Inserted test document (id: ${insertResult.insertedId})`);

    const readResult = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log(`   ✅ Read: Retrieved "${readResult.message}"`);

    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('   ✅ Delete: Cleaned up test document');

    // Drop the test collection
    await testCollection.drop();
    console.log('   ✅ Cleanup: Dropped _connection_test collection');

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ALL TESTS PASSED — MongoDB is ready for OmniCode!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Next steps:');
    console.log('  1. cd backend/next-app');
    console.log('  2. npm run dev');
    console.log('  3. Your API routes will auto-create collections on first use');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ Connection FAILED!');
    console.error('');

    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('🔍 Problem: Cannot resolve the MongoDB host');
      console.error('   Fix: Check your MONGODB_URI — cluster name might be wrong');
    } else if (error.message.includes('Authentication failed') || error.message.includes('auth')) {
      console.error('🔐 Problem: Authentication failed');
      console.error('   Fix: Check username and password in MONGODB_URI');
    } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.error('🌐 Problem: Your IP is not whitelisted');
      console.error('   Fix: Go to Atlas → Network Access → Add your current IP');
    } else if (error.message.includes('timed out') || error.message.includes('timeout')) {
      console.error('⏱️  Problem: Connection timed out');
      console.error('   Fix: Check if Atlas cluster is running and IP is whitelisted');
    } else {
      console.error(`   Error: ${error.message}`);
    }

    console.error('');
    console.error(`   Full error: ${error.message}`);
    process.exit(1);

  } finally {
    await mongoose.disconnect();
  }
}

testConnection();
