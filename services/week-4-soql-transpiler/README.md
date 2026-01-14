# 🚀 Week 4: SOQL Transpiler

A custom compiler built to translate standard SQL into Salesforce SOQL, adhering to Salesforce's object naming conventions and field limitations.

## 🏗️ Architecture
This project follows standard compiler theory:
1. **Lexer:** Scans the input string and produces tokens.
2. **Parser:** Validates syntax and builds an Abstract Syntax Tree (AST).
3. **Transpiler:** Maps SQL entities to Salesforce entities (e.g., `*` to specific fields and `Table` to `Table__c`).

## 🛠️ Usage
```bash
npx tsx index.ts

