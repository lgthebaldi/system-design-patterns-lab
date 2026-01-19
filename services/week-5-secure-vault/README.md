# Week 5: Secure Vault Service

## Overview
A security-first service designed to store sensitive credentials (API Tokens, Keys) using **Envelope Encryption**. This ensures that even if the database is compromised, the raw secrets remain encrypted and unusable without the Master Key.

## Technical Stack
* **Engine:** Node.js + TypeScript
* **Encryption:** AES-256-GCM (Authenticated Encryption)
* **Storage:** MongoDB (Encrypted Envelopes)
* **Integration:** Config-Driven UI (Metadata-based forms)

## Key Concepts
### 1. Envelope Encryption
Instead of encrypting everything with one single key, we generate a unique **Data Key (DK)** for every secret. This DK is then "wrapped" (encrypted) using the **Master Key (MK)** stored in environment variables.

### 2. AES-GCM (Galois/Counter Mode)
We chose GCM over CBC because it provides **Authenticated Encryption**. This means it detects if the encrypted data has been tampered with before attempting to decrypt it.

## API Usage
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/vault/secrets` | Encrypts and stores a new secret. |
| GET | `/api/vault/secrets/:service` | Retrieves and decrypts a secret. |
| GET | `/api/vault/list` | Lists all stored service names (safe). |