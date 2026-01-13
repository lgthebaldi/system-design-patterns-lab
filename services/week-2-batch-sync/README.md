Markdown

# 🚀 Week 2: Batch Sync Processor (High-Performance ETL)

> **Core Concept:** Handling large datasets (Big Data) in Node.js without memory overflow using Streams and Backpressure.

## 📋 Overview

In Week 1, we handled simple, synchronous API calls. In Week 2, we tackle a common engineering interview problem: **"How do you process a 5GB CSV file if you only have 512MB of RAM?"**

This module implements an asynchronous **ETL (Extract, Transform, Load)** pipeline that:
1.  **Extracts:** Streams a large CSV file from **Azure Blob Storage**.
2.  **Transforms:** Reads line-by-line using a **Stream** (minimizing memory footprint).
3.  **Loads:** Batches records (e.g., groups of 100) and processes them via a **Redis Queue (BullMQ)**.

---

## 🏗️ Architecture

The solution uses the **Producer-Consumer** pattern to decouple the heavy processing from the API response.

```mermaid
graph LR
    Azure[Azure Blob Storage] -- Stream --> Worker[Node.js Worker]
    Worker -- Backpressure --> Memory[RAM Buffer]
    Memory -- Batch (100 rows) --> Queue[Redis BullMQ]
    Queue --> Processor[Salesforce Sync]
Key Technologies
Node.js Streams: Native API to read data piece-by-piece.

Azure Blob Storage SDK: To fetch the file securely.

BullMQ (Redis): To manage job queues and retries.

Backpressure: The logic that pauses the reading stream if the processing queue gets too full, preventing crashes.

🛠️ Setup & Installation
1. Prerequisites
Ensure you have Redis running (required for the Queues).

Bash

docker start redis-triad
2. Environment Variables
This module relies on the root .env file. Ensure these keys are set:

Ini, TOML

AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=...;"
REDIS_URL=redis://localhost:6379
3. Install Dependencies
Navigate to this folder and install specific scripts dependencies:

Bash

cd services/week-2-batch-sync
npm install
⚡ Usage Guide
Step 1: Generate "Big Data"
We don't want to upload a real 5GB file. We use a script to generate a fake high-volume CSV directly into Azure.

Run this script inside services/week-2-batch-sync:

Bash

node generate_upload.js
Output: Creates big-data-import.csv (100k+ rows) in your Azure Container (high-volume-ingest).

Note: This script uses streams to write, so it won't crash your local machine either.

Step 2: Trigger the Sync
Once the file is on Azure, trigger the processing via the Main Backend API (Week 2 Route).

Via cURL:

Bash

curl -X POST http://localhost:3001/api/sync/start \
   -H "Content-Type: application/json" \
   -d '{"fileName": "big-data-import.csv"}'
Via Frontend:

Go to http://localhost:5173/batch-sync

Click "Start Batch Sync"

Step 3: Monitor Performance
Watch the Backend Terminal. You will see the stream in action:

Plaintext

🚀 Worker started job: full-import
📥 Downloading stream from Azure: big-data-import.csv...
📦 Batch #1 processed: 100 records.
📦 Batch #2 processed: 100 records.
...
✅ Job Completed! Total Rows Processed: 100000
🧠 Deep Dive: Why Streams?
If we used fs.readFile(), Node.js would try to load the entire 100k rows into the V8 Heap. For small files, this is fine. For GB-sized files, the application would crash with FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed.

Our Solution: We pipe the Azure download stream into a CSV parser.

Read chunk.

Is buffer full? -> Pause Stream.

Process Batch.

Buffer empty? -> Resume Stream.

This keeps memory usage constant flat, regardless of file size.