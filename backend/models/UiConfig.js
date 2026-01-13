// backend/models/UiConfig.js
const mongoose = require('mongoose');

const UiConfigSchema = new mongoose.Schema({
    screenName: { 
        type: String, 
        required: true, 
        unique: true // Ex: 'dashboard', 'login', 'settings'
    },
    title: String,
    layout: { 
        type: Array, // Aqui mora a mágica: Uma lista de componentes flexíveis
        required: true 
    },
    version: { type: Number, default: 1 }
});

module.exports = mongoose.model('UiConfig', UiConfigSchema);