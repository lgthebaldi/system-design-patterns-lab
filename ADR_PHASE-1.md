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

# ADR 003: Server-Driven UI Engine (Week 3)

## Status
Accepted

## Context
In a traditional client-side rendering approach, the UI layout is hardcoded in the Frontend application.
Business requirements frequently demand minor UI changes (e.g., changing text, reordering sections, toggling features based on flags).
Currently, every small UI change triggers a full CI/CD pipeline, resulting in slow "Time-to-Market" and "Deployment Fatigue."

## Decision
We decided to implement a **Server-Driven UI** architecture. The definition of the screen structure is moved from the React code to a **MongoDB** document.
The Frontend acts as a "Dumb Renderer," recursively mapping JSON objects to pre-defined UI components.

### Key Architectural Choices:

1.  **Data Store:**
    * **Decision:** Use **MongoDB**.
    * **Reasoning:** Unlike SQL, MongoDB allows storing complex, deeply nested JSON structures (Component Trees) naturally without rigid schema migrations.

2.  **Rendering Strategy:**
    * **Decision:** **Recursive Component Pattern** in React.
    * **Reasoning:** UI structures are hierarchical (A Section contains a Card, which contains a Button). Recursion allows the engine to render infinite levels of nesting without writing specific code for each depth level.

3.  **Component Map:**
    * **Decision:** Static Dictionary (`type` -> `Component`).
    * **Reasoning:** Provides security. The backend cannot inject arbitrary code (XSS), it can only request components that explicitly exist in the Frontend's registry.

## Consequences
* **Positive:**
    * **Agility:** Marketing/Product teams can theoretically update the UI via a CMS without engineering involvement.
    * **Consistency:** Enforces the use of a Design System; developers cannot create "custom hacky buttons" easily.
* **Negative:**
    * **Complexity:** Building the "Engine" is harder than just building a page.
    * **Versioning:** Breaking changes in the Component Props can crash older versions of the Frontend (e.g., Mobile Apps that users haven't updated).

## Compliance
* **Flexibility:** JSON-based Layouts.
* **Security:** No `eval()` or dangerous code injection; strictly mapped components.


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