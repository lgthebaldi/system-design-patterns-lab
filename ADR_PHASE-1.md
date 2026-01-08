# ADR 001: Secure Orchestration & Multi-Cloud Identity Management

## Status
Accepted

## Context
The project requires a secure mechanism to trigger Python automation scripts that interact with sensitive cloud environments (AWS S3, Azure Entra ID, Salesforce). 
Directly exposing these scripts via a simple API would create security vulnerabilities. We needed a robust architecture to handle authentication, session management, and process orchestration.

## Decision
We decided to implement a **Backend-for-Frontend (BFF)** pattern using **Node.js** to act as a secure gateway between the React Frontend and the Python Automation Services.

### Key Architectural Choices:

1.  **Identity Provider (IdP):**
    * **Decision:** Use **Salesforce** via OAuth 2.0 (Authorization Code Flow).
    * **Reasoning:** Leverages existing enterprise identity infrastructure, avoiding the need to build a custom user database.

2.  **Session Management:**
    * **Decision:** Implement **JWT (JSON Web Tokens)** signed with **RS256** (Asymmetric Encryption).
    * **Reasoning:** RS256 ensures that only the Backend (holding the Private Key) can issue tokens, while other services can verify them using the Public Key. This prevents token tampering.

3.  **State & Caching:**
    * **Decision:** Use **Redis** (via Docker).
    * **Reasoning:** Provides low-latency storage for user sessions and allows for implementing "Blocklists" for secure logout functionality.

4.  **Orchestration:**
    * **Decision:** Node.js `child_process` execution.
    * **Reasoning:** Allows the backend to securely spawn isolated Python environments to run the integration scripts without blocking the main event loop.

## Consequences
* **Positive:** * Security is decoupled from the business logic (Python scripts).
    * The frontend never handles cloud secrets (AWS/Azure keys), only the JWT.
    * Scalable architecture ready for microservices.
* **Negative:**
    * Increased infrastructure complexity (requires Redis and Docker).
    * Requires management of RSA keys (Private/Public).

## Compliance
* **Security:** Meets OAuth 2.0 standards.
* **Encryption:** RS256 for token signing.
