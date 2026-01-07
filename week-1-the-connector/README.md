# Week 1: The Hybrid Cloud Connector (AWS + Salesforce)

## 📌 Overview
This project demonstrates a cross-cloud integration between **AWS (S3)** and **Salesforce**, orchestrated by a Python-based middleware. The primary goal was to fetch sensitive configuration data from an S3 Bucket and securely push it into Salesforce as a business record (Case).

## 🛠️ Tech Stack
- **Language:** Python 3.10+
- **Cloud Providers:** AWS (S3), Salesforce (Sales Cloud)
- **Identity & Security:** OAuth 2.0 (REST Handshake), AWS IAM, Pydantic (Data Validation)
- **Libraries:** `boto3`, `simple-salesforce`, `requests`, `python-dotenv`

## 🏗️ Architecture
The integration follows a "Service-to-Service" pattern:
1. **AWS S3:** Acts as the configuration provider.
2. **Python Middleware:** - Authenticates with AWS via IAM.
   - Performs a custom REST Handshake with Salesforce.
   - Validates data integrity.
3. **Salesforce:** Receives the payload via REST API and creates a new `Case` record.



## 🚀 How to Run
1. Ensure your `.env` file is configured in the root directory.
2. Activate your virtual environment: `source venv/bin/activate`
3. Run the orchestrator:
   ```bash
   python week-1-the-connector/main.py