// backend/controllers/vaultController.js
const mongoose = require('mongoose');
const path = require('path');

/**
 * IMPORT NOTE:
 * We use the CryptoEngine developed in Week 5.
 * Since the backend runs with ts-node/register, we can import .ts files.
 */
const { CryptoEngine } = require('../../services/week-5-secure-vault/crypto-engine.ts');

// Schema to store the encrypted envelope in MongoDB
const SecretSchema = new mongoose.Schema({
    serviceName: { type: String, required: true, unique: true },
    envelope: {
        ciphertext: String,
        iv: String,
        tag: String,
        encryptedDK: String,
        dkIv: String,
        dkTag: String
    },
    updatedAt: { type: Date, default: Date.now }
});

const SecretModel = mongoose.model('VaultSecret', SecretSchema);
const engine = new CryptoEngine();

/**
 * Stores a new encrypted secret in the database
 */
exports.storeSecret = async (req, res) => {
    try {
        const { serviceName, plainText } = req.body;
        
        if (!serviceName || !plainText) {
            return res.status(400).json({ error: "Missing serviceName or plainText" });
        }

        // Generate the secure envelope using Key Wrapping (Envelope Encryption)
        const envelope = engine.encrypt(plainText);

        // Upsert the secret in MongoDB
        const result = await SecretModel.findOneAndUpdate(
            { serviceName },
            { envelope, updatedAt: Date.now() },
            { upsert: true, new: true }
        );

        console.log(`🔒 Vault: Secret stored for service [${serviceName}]`);
        res.status(201).json({ success: true, id: result._id });
    } catch (error) {
        console.error("❌ Vault Store Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Retrieves and decrypts a secret from the vault
 */
exports.getSecret = async (req, res) => {
    try {
        const { serviceName } = req.params;
        const secretDoc = await SecretModel.findOne({ serviceName });

        if (!secretDoc) {
            return res.status(404).json({ error: "Secret not found in vault" });
        }

        // Unwrap the Data Key and decrypt the content
        const decrypted = engine.decrypt(secretDoc.envelope);

        console.log(`🔑 Vault: Secret retrieved and decrypted for [${serviceName}]`);
        res.json({ success: true, decrypted });
    } catch (error) {
        console.error("❌ Vault Retrieval Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};