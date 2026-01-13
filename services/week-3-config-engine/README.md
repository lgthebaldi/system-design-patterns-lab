# 🧩 Week 3: The Config Engine (Server-Driven UI)

> **Core Concept:** Decoupling the UI structure from the Frontend code. The Backend (MongoDB) dictates "WHAT" to render, and React only knows "HOW" to render.

## 📋 Overview

In traditional development, changing a button color or adding a section requires a code change, a build, and a deployment. 
In **Server-Driven UI**, the application layout is fetched as a JSON object from the API at runtime. This allows for:
* **Instant Updates:** Change the UI without app store updates or deployments.
* **A/B Testing:** Serve different layouts to different users easily.
* **Personalization:** Show specific sections based on User Role.

---

## 🏗️ Architecture

The solution relies on **Recursion**. Since a UI component (like a Section) can contain other components, the Rendering Engine must be able to call itself.

```mermaid
graph TD
    DB[(MongoDB)] -->|JSON Layout| API[Node.js API]
    API -->|GET /config/home| React[React Frontend]
    
    subgraph "Recursive Render Engine"
        React -->|Read Type| Mapper{Component Map}
        Mapper -->|'button'| Btn[Render Button]
        Mapper -->|'section'| Sect[Render Section]
        Sect -->|Has Children?| Mapper
    end
JSON Structure Example
The database stores the UI definition like this:

JSON

{
  "screenName": "home",
  "layout": [
    {
      "type": "section",
      "props": { "title": "Overview" },
      "children": [
        { "type": "card", "props": { "title": "Revenue", "value": "$50k" } }
      ]
    }
  ]
}
🛠️ Setup & Installation
1. Prerequisites
Ensure MongoDB is running:

Bash

docker start mongo-triad
2. Install Dependencies
Navigate to this folder:

Bash

cd services/week-3-config-engine
npm install
3. Database Seeding
Since we don't have an Admin Panel yet, we use a script to inject the JSON layout into MongoDB:

Bash

node seed.js
Output: ✅ Database seeded with 'home' screen config!

🚀 Usage
Start the Backend (npm run dev in /backend).

Start the Frontend (npm run dev in /frontend).

Navigate to /server-driven.

To change the UI, simply edit seed.js, change the JSON structure, run node seed.js again, and refresh the browser. No Frontend code changes required.

📦 Tech Stack
Database: MongoDB (Flexible Schema for nested JSON).

Backend: Node.js + Mongoose.

Frontend: React (Recursive Components).