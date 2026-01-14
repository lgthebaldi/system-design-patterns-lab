# 🚀 Week 4: SOQL Transpiler Service

> **Core Concept:** A specialized compiler engine that translates standard SQL queries into Salesforce-compliant SOQL (Salesforce Object Query Language).

## 📋 Overview
This service demonstrates **Compiler Theory** applied to real-world integration challenges. Salesforce does not support `SELECT *` and requires specific object suffixes (`__c`). This engine automates that translation using a formal Lexer and Parser.

## 🏗️ Architecture
The service is structured as a classic compiler pipeline:
1. **Lexer (Tokenization):** Breaks the input string into a stream of logical tokens (Keywords, Identifiers, Operators).
2. **Parser (Syntactic Analysis):** Consumes tokens to build an **Abstract Syntax Tree (AST)**, validating the SQL grammar.
3. **Transpiler (Code Generation):** Traverses the AST and applies mapping rules (e.g., mapping `User` to `User__c` and expanding `*` into defined fields).



## 🛠️ Integration
- **Backend:** Integrated into the Node.js Orchestrator via `ts-node/register` for real-time TS execution.
- **Frontend:** React-based Playground for instant query testing.

## 🚀 How to Run
From the root project, ensure the backend is running:
```bash
cd backend
node server.js