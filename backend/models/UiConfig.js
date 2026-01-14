const mongoose = require('mongoose');

// Schema rigoroso validado para o Masterplan W3 conforme sua especificação
const UiConfigSchema = new mongoose.Schema({
    screenName: { type: String, required: true, unique: true },
    title: String,
    // O layout é uma estrutura de árvore com validação interna
    layout: [{
        type: { type: String, required: true }, 
        props: mongoose.Schema.Types.Mixed,    
        children: [mongoose.Schema.Types.Mixed], 
        validation: {                          
            required: Boolean,
            min: Number,
            errorMessage: String
        }
    }]
});

// Evita erro de re-compilação do model no Node
module.exports = mongoose.models.UiConfig || mongoose.model('UiConfig', UiConfigSchema);