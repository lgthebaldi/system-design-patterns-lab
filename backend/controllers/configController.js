// backend/controllers/configController.js
const UiConfig = require('../models/UiConfig');

const getScreenConfig = async (req, res) => {
    try {
        const { screenName } = req.params;
        
        // Busca no Mongo pela tela solicitada
        const config = await UiConfig.findOne({ screenName });

        if (!config) {
            return res.status(404).json({ error: 'Screen configuration not found' });
        }

        // Retorna o JSON puro para o Frontend desenhar
        res.json(config);

    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getScreenConfig };