import os
import boto3
import msal
from connection_final import get_salesforce_connection
from s3_reader import get_lab_bucket, read_file_content
from dotenv import load_dotenv

load_dotenv()

def get_azure_token():
    """
    Authenticates with Microsoft Entra ID (Azure AD) using Client Secret.
    This validates the script's identity in the Microsoft ecosystem.
    """
    print("🔵 Authenticating with Azure Entra ID...")
    
    authority = f"https://login.microsoftonline.com/{os.getenv('AZURE_TENANT_ID')}"
    app = msal.ConfidentialClientApplication(
        os.getenv('AZURE_CLIENT_ID'),
        authority=authority,
        client_credential=os.getenv('AZURE_CLIENT_SECRET')
    )

    # Scopes for Microsoft Graph (Standard Identity Check)
    result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])
    
    if "access_token" in result:
        print("✅ Azure Identity Verified!")
        return True
    else:
        print(f"❌ Azure Auth Failed: {result.get('error_description')}")
        return False

def run_triad_integration():
    print("🚀 Starting FULL TRIAD Integration: AWS -> Azure -> Salesforce")

    # --- PHASE 1: AWS S3 ---
    s3_client = boto3.client('s3', region_name="us-east-1")
    bucket_name = get_lab_bucket(s3_client)
    cloud_data = read_file_content(s3_client, bucket_name)
    
    if not cloud_data: return

    # --- PHASE 2: AZURE IDENTITY CHECK ---
    # In a real scenario, this token would be used to access Azure Blob or SQL.
    # Here, we validate the script's permission to exist in the architecture.
    if not get_azure_token(): return

    # --- PHASE 3: SALESFORCE DELIVERY ---
    sf = get_salesforce_connection()
    if not sf: return

    try:
        sf.Case.create({
            'Subject': 'Full Triad Sync - Week 1',
            'Description': f"Validated by Azure AD. Data from AWS: {cloud_data}",
            'Status': 'New',
            'Priority': 'Medium'
        })
        print("✅ SUCCESS: All three clouds connected and verified!")
    except Exception as e:
        print(f"❌ Salesforce Error: {e}")

if __name__ == "__main__":
    run_triad_integration()