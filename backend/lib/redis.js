// backend/lib/redis.js
const { Redis } = require('ioredis');

/**
 * REDIS CONNECTION CONFIGURATION
 * Using ioredis client for high performance and compatibility with BullMQ.
 * It automatically attempts to reconnect on failure.
 */
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null, // Required by BullMQ for task processing
  enableReadyCheck: false,
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true; // Force reconnect on readonly error
    }
    return false;
  }
});

// Event listeners for monitoring connection health
connection.on('connect', () => {
  console.log('✅ [Redis] Connection established successfully!');
});

connection.on('error', (err) => {
  console.error('❌ [Redis] Connection failed:', err.message);
});

module.exports = connection;