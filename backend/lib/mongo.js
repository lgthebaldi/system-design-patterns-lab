// backend/lib/mongo.js
const mongoose = require('mongoose');

/**
 * MONGODB CONNECTION MANAGER
 * Configures the connection to the MongoDB instance running in Docker.
 * Includes event listeners for monitoring and better error resilience.
 */
const connectMongo = async () => {
    // Configuration options for stability
    const mongoOptions = {
        autoIndex: true, // Build indexes automatically
        serverSelectionTimeoutMS: 5000, // Wait 5 seconds before failing
    };

    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/triad_system';

    try {
        await mongoose.connect(mongoUri, mongoOptions);
        console.log('🍃 [MongoDB] Connected successfully to triad_system!');
    } catch (error) {
        console.error('❌ [MongoDB] Initial Connection Error:', error.message);
        // Instead of process.exit, we log and allow the server to keep running
        // This prevents the entire orchestrator from crashing due to a transient DB issue
    }
};

// Listen for connection events to monitor health after initial boot
mongoose.connection.on('error', (err) => {
    console.error('⚠️ [MongoDB] Runtime Connection Error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ [MongoDB] Connection lost. Attempting to reconnect...');
});

module.exports = connectMongo;