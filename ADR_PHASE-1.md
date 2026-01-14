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

# ADR 003: Implementation of Server-Driven UI (SDUI)

## Status
Accepted

## Context
We needed a way to update the application's layout and business validation rules without requiring a new build/deploy of the Frontend or waiting for App Store approvals. The system must support complex, nested layouts.

## Decision
We implemented a **Server-Driven UI (SDUI)** pattern using:
1.  **Recursive Component Rendering:** A `RenderEngine` in React that maps JSON types to components and handles nested `children`.
2.  **Metadata-Defined Logic:** Validation rules (Required, Min/Max) are stored in MongoDB and interpreted by the Frontend components at runtime.
3.  **Strict Schema:** Although MongoDB is schemaless, we enforced a strict structure in the Application Layer (Mongoose) to prevent UI crashes.

## Consequences
* **Positive:**
    * **Agility:** Changing the `seed.js` or a database entry updates the production UI instantly.
    * **Consistency:** The same JSON structure can theoretically drive Mobile (React Native) and Web (React).
* **Negative:**
    * **Complexity:** Debugging requires checking the data flow from DB -> API -> Renderer.
    * **Payload Size:** Large, complex screens result in larger JSON payloads.

## Compliance
* **Schema:** Must include `type`, `props`, and `children` for every node.
* **Validation:** All inputs must support the `validation` metadata object.


# ADR 004: Polyglot Architecture with API Gateway (Week 4)

## Status
Accepted

## Context
Our application requires complex financial calculations. Implementing these in Node.js is possible but inefficient compared to Python's ecosystem (Pandas, NumPy, native math handling).
However, exposing multiple APIs (Node on 3001, Python on 8000) to the Frontend creates "CORS Hell," security risks, and tight coupling.

## Decision
We decided to implement the **API Gateway Pattern** (specifically, the "Backends for Frontends" variation).
1.  **Node.js** acts as the single public entry point (Gateway).
2.  **Python (FastAPI)** runs as a private microservice.
3.  We use `http-proxy-middleware` in Express to transparently route requests from `/api/finance` to the Python instance.

## Consequences
* **Positive:**
    * **Decoupling:** We can rewrite the finance service in Go or Rust later without changing the Frontend or the Gateway URL.
    * **Simplicity:** The Frontend client remains simple (one base URL).
    * **Performance:** CPU-intensive tasks are offloaded from the Node.js Event Loop.
* **Negative:**
    * **Operational Overhead:** We now have two runtimes to manage (Node + Python) and monitor.
    * **Latency:** There is a small network hop overhead between Node and Python (negligible for localhost, but must be monitored in cloud).

## Compliance
* **Port 3001:** Public Gateway.
* **Port 8000:** Private Financial Service.