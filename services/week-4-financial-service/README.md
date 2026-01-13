# 💸 Week 4: Polyglot Microservices & API Gateway

> **Core Concept:** Using an API Gateway (Node.js) to route traffic to specialized microservices (Python), creating a "Polyglot Architecture" where the best tool is used for each job.

## 📋 Overview

Heavy mathematical computations (like compound interest, data science, or AI) are often better handled by Python than Node.js. However, the Frontend should not need to know multiple API URLs.

**The Solution:**
We transformed the Node.js Backend into an **API Gateway**. It acts as a reverse proxy, forwarding specific requests (`/api/finance`) to a hidden Python Microservice.

---

## 🏗️ Architecture

```mermaid
graph LR
    User[React Frontend] -->|POST /api/finance| Node[Node.js Gateway]
    
    subgraph "Backend Layer"
        Node -->|Auth & Validation| Node
        Node -->|Proxy Request| Python[Python FastAPI Service]
    end
    
    Python -->|Calculates Interest| Python
    Python -->|JSON Response| Node
    Node -->|Final Response| User
Why this pattern?
Single Entry Point: The Frontend only deals with localhost:3001. No CORS hell with multiple ports.

Specialization: Node handles I/O and Orchestration. Python handles CPU-heavy Math.

Security: The Python service can remain in a private network, accessible only by the Gateway.

🛠️ Setup & Installation
1. Prerequisites
Ensure the Gateway (Node) is running on port 3001.

2. Python Environment
Navigate to the service folder:

Bash

cd services/week-4-financial-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt # (or pip install fastapi uvicorn)
3. Run the Microservice
Bash

uvicorn main:app --reload --port 8000
The service will start at http://localhost:8000

🚀 Usage
Endpoint: POST http://localhost:3001/api/finance/calculate-compound

Payload:

JSON

{
  "principal": 5000,
  "rate": 10,
  "years": 20
}
📦 Tech Stack
Gateway: Node.js + http-proxy-middleware

Service: Python 3 + FastAPI + Uvicorn

Protocol: HTTP REST