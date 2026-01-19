// backend/controllers/configController.js
const UiConfig = require('../models/UiConfig');

const getScreenConfig = async (req, res) => {
    try {
        const { screenName } = req.params;
        let config = await UiConfig.findOne({ screenName });

        if (!config && screenName === 'vault') {
            config = {
                screenName: "vault",
                title: "Secure Vault Manager",
                description: "Encrypt and store sensitive service credentials using AES-256-GCM",
                apiEndpoint: "/api/vault/secrets",
                fields: [
                    {
                        id: "serviceName",
                        type: "input", // ADICIONADO EXPLÍCITO
                        label: "Service Name",
                        placeholder: "e.g., Salesforce-Production",
                        required: true
                    },
                    {
                        id: "plainText",
                        type: "input", // ADICIONADO EXPLÍCITO
                        label: "Secret Token",
                        placeholder: "Enter token here",
                        required: true
                    }
                ],
                actions: [
                    { id: "save", label: "Encrypt & Store", method: "POST" }
                ]
            };
        }

        if (!config) return res.status(404).json({ message: "Config not found" });
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getScreenConfig };