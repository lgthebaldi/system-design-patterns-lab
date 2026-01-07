# Week 1: The Full Triad Connector (AWS + Azure + Salesforce)

## 📌 Overview
This project establishes a secure, cross-cloud orchestration between three major providers. It fetches data from **AWS**, validates the identity via **Azure**, and records the business outcome in **Salesforce**.

## 🛠️ Tech Stack
- **Language:** Python 3.10+
- **Cloud Providers:** - **AWS (S3):** Data Provider.
  - **Azure (Entra ID):** Identity & Authentication Provider.
  - **Salesforce:** Business Logic & CRM Provider.
- **Libraries:** `boto3`, `msal` (Microsoft Auth), `simple-salesforce`, `requests`, `python-dotenv`

## 🏗️ Architecture
The integration follows the **Triad Pattern**:
1. **AWS S3:** Script locates a dynamic bucket and reads configuration data in-memory.
2. **Azure Entra ID:** Script performs a Service-to-Service authentication using **MSAL** to verify its identity in the Microsoft ecosystem.
3. **Salesforce:** Once identity and data are verified, a REST Handshake is performed to create a `Case` record.



## 🚀 How to Run
Execute from the project root:
```bash
python week-1-the-connector/main.py



📈 Results
Multi-cloud authentication managed via a single middleware.

Successfully bypassed Salesforce SOAP restrictions using modern REST OAuth2.

Zero-trust approach: Identity verified by Azure before any Salesforce write operation.