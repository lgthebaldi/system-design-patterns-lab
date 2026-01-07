# Architectural Decision Record (ADR) - Phase 1

## Context
Initial attempts to connect to Salesforce using the standard `simple-salesforce` login method failed. Modern Salesforce Developer Orgs (2025/2026) have the legacy SOAP API disabled by default, throwing an `INVALID_OPERATION` error.

## Decision 1: Custom OAuth2 REST Handshake
- **Status:** Accepted
- **Problem:** The library's default `Salesforce(username, password, token)` uses the SOAP `login()` method, which is blocked.
- **Solution:** Implemented a manual HTTP POST request to the `/services/oauth2/token` endpoint using a **Connected App (Consumer Key & Secret)**. 
- **Consequence:** We successfully bypassed the SOAP restriction and obtained a valid `access_token` for the REST API.

## Decision 2: In-Memory Data Consumption from AWS S3
- **Status:** Accepted
- **Problem:** Storing cloud data in local temporary files poses a security risk.
- **Solution:** Used `boto3`'s `get_object()['Body'].read().decode('utf-8')` to process S3 content directly in RAM.
- **Consequence:** Improved security and performance by reducing I/O operations.

## Decision 3: Root-Level Execution (CWD Management)
- **Status:** Accepted
- **Problem:** Running scripts from subdirectories caused `FileNotFoundError` for the `.env` file.
- **Solution:** Standardized script execution from the project root (`system-design-patterns-lab`).
- **Consequence:** Consistent environment variable loading and predictable module import paths.

## Decision 4: Identity Verification via Azure Entra ID (MSAL)
- **Status:** Accepted
- **Problem:** How to ensure the script is an authorized entity within the corporate ecosystem before touching the CRM?
- **Solution:** Integrated **Microsoft Authentication Library (MSAL)** to perform a client-credential flow.
- **Reasoning:** Using Azure Entra ID as a centralized identity provider is a standard enterprise architecture (Identity-First Security).
- **Consequence:** The script now requires valid Azure credentials to run, adding a layer of security beyond just Salesforce/AWS keys.

## Challenges Overcome
1. **The "Silent" Error:** Found that a mismatch between `.env` variable names and `os.getenv()` calls was preventing connection.
2. **Identity Management:** Managed multiple Salesforce security resets while maintaining the Connected App's integrity.
