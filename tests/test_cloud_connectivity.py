import os
import boto3
import requests
from msal import ConfidentialClientApplication
from dotenv import load_dotenv
from pathlib import Path

# --- DIRECTORY ORCHESTRATION ---
# Dynamically locates the project root to ensure .env is found regardless of execution path
root_dir = Path(__file__).resolve().parent.parent
env_path = root_dir / '.env'
load_dotenv(dotenv_path=env_path)

def test_triad_auth():
    print(f"--- 🔍 Starting Triad Connectivity Test ---")
    print(f"Project Root: {root_dir}")
    print(f"Loading .env from: {env_path}\n")
    
    # 1. AWS S3 CONNECTIVITY TEST
    # Validates if IAM credentials can perform basic operations
    try:
        s3 = boto3.client('s3')
        s3.list_buckets()
        print("✅ AWS: Connectivity OK (S3 Access Validated)")
    except Exception as e:
        print(f"❌ AWS: Failed - {e}")

    # 2. SALESFORCE REST OAUTH2 HANDSHAKE
    # Bypasses SOAP restrictions using Decision 1 from ADR
    try:
        consumer_key = os.getenv('SF_CONSUMER_KEY')
        consumer_secret = os.getenv('SF_CONSUMER_SECRET')
        username = os.getenv('SF_USERNAME')
        password = os.getenv('SF_PASSWORD')
        security_token = os.getenv('SF_TOKEN')

        if not all([consumer_key, consumer_secret, username, password, security_token]):
            # Debugging check for missing variables
            missing = [k for k, v in {
                "SF_CONSUMER_KEY": consumer_key,
                "SF_CONSUMER_SECRET": consumer_secret,
                "SF_USERNAME": username,
                "SF_PASSWORD": password,
                "SF_TOKEN": security_token
            }.items() if not v]
            raise ValueError(f"Missing OAuth2 credentials in .env file: {missing}")

        # Manual token request via Salesforce REST API
        token_url = "https://login.salesforce.com/services/oauth2/token"
        payload = {
            'grant_type': 'password',
            'client_id': consumer_key,
            'client_secret': consumer_secret,
            'username': username,
            'password': f"{password}{security_token}"
        }

        response = requests.post(token_url, data=payload)
        
        if response.status_code == 200:
            print("✅ Salesforce: Connectivity OK (REST OAuth2 Handshake Successful)")
        else:
            error_data = response.json()
            print(f"❌ Salesforce: Failed - {error_data.get('error_description', 'Unknown Error')}")

    except Exception as e:
        print(f"❌ Salesforce: Error - {e}")

    # 3. AZURE ENTRA ID (MSAL) TEST
    # Validates service-to-service identity verification
    try:
        tenant_id = os.getenv('AZURE_TENANT_ID')
        client_id = os.getenv('AZURE_CLIENT_ID')
        client_secret = os.getenv('AZURE_CLIENT_SECRET')

        if not all([tenant_id, client_id, client_secret]):
            print("⚠️  Azure: Skipping test (Credentials not found in .env)")
        else:
            app = ConfidentialClientApplication(
                client_id, 
                authority=f"https://login.microsoftonline.com/{tenant_id}",
                client_credential=client_secret
            )
            result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])
            
            if "access_token" in result:
                print("✅ Azure Entra ID: Connectivity OK (Token Acquired via MSAL)")
            else:
                print(f"❌ Azure: Failed - {result.get('error_description')}")
    except Exception as e:
        print(f"❌ Azure: Error - {e}")

if __name__ == "__main__":
    test_triad_auth()