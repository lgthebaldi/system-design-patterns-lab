import os
import sys
import requests
from simple_salesforce import Salesforce
from dotenv import load_dotenv

# 1. Load Environment Variables
load_dotenv()

# DEBUG: Check if variables are actually being loaded
print(f"DEBUG: Username loaded: {os.getenv('SF_USERNAME')}")
print(f"DEBUG: Key loaded: {os.getenv('SF_CONSUMER_KEY')}")

if os.getenv('SF_USERNAME') is None:
    print("❌ ERROR: .env file not found or empty!")

# Configuration
LOGIN_DOMAIN = 'login'  # Use 'test' for Sandbox, 'login' for Dev/Prod

def get_salesforce_connection():
    """
    Performs a manual REST authentication (OAuth2 Password Flow) to bypass
    default SOAP API blocks in modern Salesforce Orgs.
    Returns an authenticated simple-salesforce client instance.
    """
    print("🔌 Starting Hybrid Connection (REST Handshake -> Simple-Salesforce)...")

    # 2. Retrieve Credentials from .env
    username = os.getenv('SF_USERNAME')
    password = os.getenv('SF_PASSWORD')
    token = os.getenv('SF_TOKEN')
    consumer_key = os.getenv('SF_CONSUMER_KEY')
    consumer_secret = os.getenv('SF_CONSUMER_SECRET')

    # Validation
    if not all([username, password, token, consumer_key, consumer_secret]):
        print("❌ CRITICAL ERROR: Missing environment variables in .env file.")
        print("Please check: SF_USERNAME, SF_PASSWORD, SF_TOKEN, SF_CONSUMER_KEY, SF_CONSUMER_SECRET")
        sys.exit(1)

    # 3. Request Access Token via HTTP (Bypassing SOAP)
    token_url = f"https://{LOGIN_DOMAIN}.salesforce.com/services/oauth2/token"
    
    payload = {
        'grant_type': 'password',
        'client_id': consumer_key,
        'client_secret': consumer_secret,
        'username': username,
        'password': password + token  # Concatenating Password + Security Token
    }

    try:
        response = requests.post(token_url, data=payload)
        
        if response.status_code != 200:
            print(f"❌ Authentication Failed. HTTP Status: {response.status_code}")
            print(f"Server Response: {response.text}")
            return None

        auth_data = response.json()
        access_token = auth_data['access_token']
        instance_url = auth_data['instance_url']
        
        print("🔑 Access Token retrieved successfully via REST.")

        # 4. Inject Token into Simple-Salesforce Library
        # This initializes the client without triggering a login attempt
        sf_client = Salesforce(
            instance_url=instance_url,
            session_id=access_token
        )
        return sf_client

    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return None

if __name__ == "__main__":
    # Execute Connection Test
    sf = get_salesforce_connection()
    
    if sf:
        print("\n✅ CONNECTION ESTABLISHED! Python is now controlling Salesforce.")
        
        # Final Smoke Test: Fetch Org Details
        try:
            print("🔍 Fetching Organization Details...")
            org = sf.query("SELECT Name, OrganizationType, IsSandbox FROM Organization")
            org_record = org['records'][0]
            
            print(f"   🏢 Org Name: {org_record['Name']}")
            print(f"   ⚙️ Type: {org_record['OrganizationType']}")
            print(f"   📦 Sandbox: {org_record['IsSandbox']}")
            print("   🚀 System ready for Phase 2.")
            
        except Exception as e:
            print(f"❌ Query Error: {e}")