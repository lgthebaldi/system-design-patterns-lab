// backend/lib/redis.js
const { Redis } = require('ioredis');

// Redis configuration (fetching from .env or default to localhost)
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null, // BullMQ requirement
  enableReadyCheck: false
});

connection.on('connect', () => console.log('✅ Connected to Redis!'));
connection.on('error', (err) => console.error('❌ Redis Connection Error:', err));

module.exports = connection;
