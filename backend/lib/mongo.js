// backend/lib/mongo.js
const mongoose = require('mongoose');

const connectMongo = async () => {
    try {
        // Conecta ao container Docker do Mongo
        await mongoose.connect('mongodb://localhost:27017/triad_system');
        console.log('🍃 Connected to MongoDB!');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

module.exports = connectMongo;