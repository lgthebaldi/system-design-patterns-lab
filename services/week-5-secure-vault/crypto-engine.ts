import crypto from 'crypto';
import * as dotenv from 'dotenv';
import path from 'path';

// Use process.cwd() or __dirname depending on environment to find .env
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

export interface CryptoEnvelope {
    ciphertext: string;
    iv: string;
    tag: string;
    encryptedDK: string;
    dkIv: string;
    dkTag: string;
}

export class CryptoEngine {
    private masterKey: Buffer;

    constructor() {
        const password = process.env.VAULT_MASTER_KEY;
        
        if (!password) {
            throw new Error("CRITICAL ERROR: VAULT_MASTER_KEY not found in .env");
        }

        // Derive a 32-byte Master Key (MK) using scrypt
        this.masterKey = crypto.scryptSync(password, 'triad-salt', 32);
    }

    public encrypt(plainText: string): CryptoEnvelope {
        // 1. Generate a random 32-byte Data Key (DK)
        const dataKey = crypto.randomBytes(32);

        // 2. Encrypt the data with the Data Key (DK) using AES-256-GCM
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', dataKey, iv);
        const encryptedData = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();

        // 3. ENVELOPE: Encrypt the Data Key (DK) using the Master Key (MK)
        const dkIv = crypto.randomBytes(16);
        const dkCipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, dkIv);
        const encryptedDK = Buffer.concat([dkCipher.update(dataKey), dkCipher.final()]);
        const dkTag = dkCipher.getAuthTag();

        return {
            ciphertext: encryptedData.toString('base64'),
            iv: iv.toString('base64'),
            tag: tag.toString('base64'),
            encryptedDK: encryptedDK.toString('base64'),
            dkIv: dkIv.toString('base64'),
            dkTag: dkTag.toString('base64')
        };
    }

    public decrypt(envelope: CryptoEnvelope): string {
        // 1. Open the Envelope: Decrypt the Data Key (DK) using the Master Key (MK)
        const dkIv = Buffer.from(envelope.dkIv, 'base64');
        const dkTag = Buffer.from(envelope.dkTag, 'base64');
        const encryptedDK = Buffer.from(envelope.encryptedDK, 'base64');

        const dkDecipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, dkIv);
        dkDecipher.setAuthTag(dkTag);
        const dataKey = Buffer.concat([dkDecipher.update(encryptedDK), dkDecipher.final()]);

        // 2. Use the recovered Data Key to decrypt the actual secret
        const iv = Buffer.from(envelope.iv, 'base64');
        const tag = Buffer.from(envelope.tag, 'base64');
        const data = Buffer.from(envelope.ciphertext, 'base64');

        const decipher = crypto.createDecipheriv('aes-256-gcm', dataKey, iv);
        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);

        return decrypted.toString('utf8');
    }
}