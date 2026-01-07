import os
import sys
from simple_salesforce import Salesforce, SalesforceLogin
from simple_salesforce.exceptions import SalesforceAuthenticationFailed
from dotenv import load_dotenv

# 1. Load Environment Variables
load_dotenv()

USERNAME = os.getenv('SF_USERNAME')
PASSWORD = os.getenv('SF_PASSWORD')
TOKEN = os.getenv('SF_TOKEN') # The security token from email
DOMAIN = 'login' # Use 'test' for Sandbox, 'login' for Developer Edition/Prod

def check_credentials():
    """Validates if env vars are present before trying to connect"""
    if not all([USERNAME, PASSWORD, TOKEN]):
        print("❌ CRITICAL ERROR: Missing credentials in .env file.")
        print("Ensure you have SF_USERNAME, SF_PASSWORD, and SF_TOKEN defined.")
        sys.exit(1)

def connect_to_salesforce():
    """Attempts to connect to Salesforce and return the client object"""
    print(f"🔄 Attempting connection to Salesforce as {USERNAME}...")
    
    try:
        # Standard connection flow for backend scripts (2025/2026 Standard)
        sf = Salesforce(
            username=USERNAME, 
            password=PASSWORD, 
            security_token=TOKEN, 
            domain=DOMAIN
        )
        print("✅ SUCCESS: Authentication accepted!")
        return sf
        
    except SalesforceAuthenticationFailed as e:
        print(f"❌ AUTH ERROR: Access Denied. Details: {e}")
        print("👉 Tip: Check if your Security Token is valid or if your password expired.")
        return None
    except Exception as e:
        print(f"❌ CONNECTION ERROR: {e}")
        return None

def run_smoke_test(sf):
    """Runs a simple query to prove read/write access"""
    try:
        # Test 1: Identify the Org
        print("\n🔍 Fetching Organization Details...")
        org_info = sf.query("SELECT Id, Name, OrganizationType FROM Organization")
        org_name = org_info['records'][0]['Name']
        org_id = org_info['records'][0]['Id']
        print(f"   🏢 Connected to Org: {org_name} (ID: {org_id})")

        # Test 2: Create a dummy Lead (Write Test)
        print("\n📝 Testing Write Permission (Creating a Test Lead)...")
        new_lead = sf.Lead.create({
            'FirstName': 'Triad',
            'LastName': 'Bot',
            'Company': 'Triad Arch Corp',
            'Email': 'bot@triad.com',
            'Status': 'Open - Not Contacted'
        })
        lead_id = new_lead.get('id')
        print(f"   ✅ Lead Created Successfully! ID: {lead_id}")

        # Test 3: Delete the dummy Lead (Cleanup)
        print("🧹 Cleaning up (Deleting the Test Lead)...")
        sf.Lead.delete(lead_id)
        print("   ✅ Cleanup Complete.")

    except Exception as e:
        print(f"❌ FUNCTIONAL ERROR: {e}")

if __name__ == "__main__":
    check_credentials()
    sf_client = connect_to_salesforce()
    
    if sf_client:
        run_smoke_test(sf_client)