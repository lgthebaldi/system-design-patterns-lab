# 🚀 Triad Fullstack Lab: Cloud Systems 2026

## 📌 Project Vision
This repository is an advanced **System Design** laboratory. It implements the **Triad Pattern**, orchestrating complex operations across **AWS**, **Azure**, and **Salesforce**. 

Unlike simple scripts, this project features a **Fullstack Control Plane** (React + Node.js) to trigger, monitor, and audit cloud integrations in real-time.

---

## 🏗️ Monorepo Architecture
The project is organized as a Monorepo to ensure consistency between the UI, the API, and the Cloud Services:

* **`/frontend`**: A **React (Vite)** dashboard providing a graphical interface for cloud orchestration.
* **`/backend`**: A **Node.js (Express)** orchestrator that manages communication between the UI and Python services.
* **`/services`**: Core **Python** logic containing the "Triad" scripts for deep cloud interaction (AWS, Azure, Salesforce).
* **`/venv`**: Dedicated Python Virtual Environment for secure dependency management.

---

## 🛠️ Global Tech Stack
| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript (ES6+) |
| **Backend** | Node.js, Express, Child Process Orchestration |
| **Cloud Logic** | Python 3.10+, Boto3, MSAL, Simple-Salesforce |
| **Infrastructure** | AWS (S3), Azure (Entra ID), Salesforce REST API |

---

## 📈 Current Phase: 1 - Foundations & Identity
The goal of this phase was to bypass legacy restrictions and establish a "Zero-Trust" handshake.

### [Week 1] The Hybrid Connector
* **Problem:** Modern Salesforce Orgs have SOAP API disabled by default (`INVALID_OPERATION`).
* **Solution:** Manual OAuth2 REST Handshake via Connected App.
* **Process:** 1.  **AWS S3**: Fetches dynamic configuration data directly into RAM.
    2.  **Azure Entra ID**: Performs service-to-service identity verification via MSAL.
    3.  **Salesforce**: Records the successful handshake as a `Case` or `Contact`.
* **UI Control**: Triggered via a "Run Integration" button on the React Dashboard with real-time log streaming.

---

## 🚀 Installation & Setup

### 1. Prerequisites
* Node.js (v18+) & NPM
* Python 3.10+ & Virtualenv
* Valid credentials for AWS, Azure, and Salesforce in a `.env` file at the root.

### 2. Running the Lab
You must run the **Backend** and **Frontend** in separate terminals:
**Terminal 1 (Backend Orchestrator):**
**Terminal 2 (Frontend Dashboard):**
```bash
cd frontend && npm run dev
cd backend && node server.js



# 🧪 Testing & Health Checks
Before starting development or running integrations, execute the pre-flight checks:

1. **API Health:** `node tests/test_api_health.js` (Requires Backend running)
2. **Cloud Connectivity:** `./venv/bin/python3 tests/test_cloud_connectivity.py`

