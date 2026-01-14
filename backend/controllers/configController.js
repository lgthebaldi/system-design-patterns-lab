// backend/controllers/configController.js
const UiConfig = require('../models/UiConfig');

// Exemplo de como deve estar a busca
const getScreenConfig = async (req, res) => {
  try {
    const config = await UiConfig.findOne({ screenName: req.params.screenName });
    if (!config) return res.status(404).json({ message: "Config not found" });
    res.json(config); // O Frontend espera o objeto todo aqui
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = { getScreenConfig };