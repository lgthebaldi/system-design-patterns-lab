# 🏛️ Architecture Decision Records (ADR) - Phase 1

> **Project:** Triad System Design Lab
> **Scope:** Weeks 1 to 8

---

# ADR 001: Secure Orchestration & Multi-Cloud Identity Management (Week 1)

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
* **Positive:**
    * Security is decoupled from the business logic (Python scripts).
    * The frontend never handles cloud secrets (AWS/Azure keys), only the JWT.
    * Scalable architecture ready for microservices.
* **Negative:**
    * Increased infrastructure complexity (requires Redis and Docker).
    * Requires management of RSA keys (Private/Public).

## Compliance
* **Security:** Meets OAuth 2.0 standards.
* **Encryption:** RS256 for token signing.

---

# ADR 002: High-Performance Large Data Processing (Week 2)

## Status
Accepted

## Context
Phase 1 (Week 2) introduced the requirement to synchronize large datasets (e.g., CSV files with millions of records) between Azure Storage and Salesforce.
Loading entire large files (500MB+) into the Node.js memory (Heap) using standard buffering methods causes `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed` (Out of Memory), crashing the application.
Furthermore, processing these records synchronously would cause the HTTP request to time out, resulting in a poor user experience.

## Decision
We decided to implement an **Asynchronous Producer-Consumer Architecture** utilizing **Node.js Streams** and **Redis Queues (BullMQ)** to decouple the ingestion triggering from the actual processing.

### Key Architectural Choices:

1.  **Data Ingestion Strategy:**
    * **Decision:** Use **Node.js Streams (Pipeline)** instead of Buffers.
    * **Reasoning:** Streams allow processing data chunk-by-chunk. This keeps the memory footprint constant (O(1)) regardless of the file size (e.g., a 10GB file uses the same RAM as a 10MB file).

2.  **Flow Control (Backpressure):**
    * **Decision:** Implement explicit **Backpressure** logic.
    * **Reasoning:** The mechanism pauses the file reading stream when the processing queue is full and resumes only when space is available. This prevents the "Fast Producer" (File Reader) from overwhelming the "Slow Consumer" (Database/API Insert).

3.  **Task Management:**
    * **Decision:** Use **BullMQ** backed by **Redis**.
    * **Reasoning:**
        * Decouples the API response (immediate 202 Accepted) from the long-running process.
        * Provides built-in robustness features like retries, delayed jobs, and priority management.
        * Reuses the existing Redis infrastructure from Week 1.

4.  **Storage:**
    * **Decision:** **Azure Blob Storage** with Private Access.
    * **Reasoning:** Offloads storage from the application server filesystem. Using streams, we can pipe data directly from Azure to the parser without saving a local temporary file, enhancing security and speed.

## Consequences
* **Positive:**
    * **Scalability:** The system can handle files of unlimited size bounded only by processing time, not memory.
    * **Resilience:** If the worker crashes, the job remains in Redis and can be retried.
    * **User Experience:** The UI remains responsive (Fire-and-Forget pattern).
* **Negative:**
    * **Observability Complexity:** Debugging asynchronous flows is harder than synchronous code; logs are scattered across different timeline events.
    * **State Management:** Requires tracking the status of jobs (Polling or Webhooks) to update the UI on completion.

## Compliance
* **Performance:** Maintains low memory footprint (<100MB) under load.
* **Reliability:** Implements "At-least-once" delivery semantics via Redis.
