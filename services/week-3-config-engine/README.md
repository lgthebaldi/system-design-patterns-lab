# ⚙️ Week 3: Config Engine (Server-Driven UI)

> **Core Concept:** The Backend (MongoDB) dictates the screen structure and Business Rules, allowing UI updates and logic changes without redeploying the Frontend.

## 📋 Overview
This service implements a **Metadata-Driven Architecture**. Instead of hardcoding forms and dashboards, the React Frontend acts as a "dumb" renderer that interprets a recursive JSON tree provided by the Node.js API.

## 🏗️ Architecture
- **Schema-First:** We use a strict Mongoose Schema to validate the UI components before they reach the client.
- **Recursive Rendering:** The `RenderEngine` component uses a self-calling pattern to render nested structures (e.g., Sections inside Sections).
- **Rules Engine:** Business logic (like `min: 18` for age) is sent as metadata, allowing the UI to adapt its validation dynamically.

## 🚀 How to Run
1. **Seed the Database:**
   ```bash
   node seed.js
Verify the API: Access http://localhost:3001/api/config/home to see the recursive JSON.

🛠️ Tech Stack
Backend: Node.js, Mongoose, MongoDB.

Frontend: React (Recursive Components).

Validation: Server-side defined rules via JSON.

🎯 Validation Check
[x] Recursive rendering of section components.

[x] Dynamic display of Cards, Alerts, and Inputs.

[x] Business rules injected via validation property in the JSON.