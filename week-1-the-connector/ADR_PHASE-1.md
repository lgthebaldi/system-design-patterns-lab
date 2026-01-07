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

## Challenges Overcome
1. **The "Silent" Error:** Found that a mismatch between `.env` variable names and `os.getenv()` calls was preventing connection.
2. **Identity Management:** Managed multiple Salesforce security resets while maintaining the Connected App's integrity.
