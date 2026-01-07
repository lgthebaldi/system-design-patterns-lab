import boto3
import os
# Importing local modules from the same directory
from connection_final import get_salesforce_connection
from s3_reader import get_lab_bucket, read_file_content

def run_integration():
    """
    Orchestrates the flow: 
    1. Fetches data from AWS S3
    2. Connects to Salesforce
    3. Creates a record in Salesforce with the cloud data
    """
    print("🚀 Starting Cross-Cloud Integration: AWS S3 -> Salesforce")

    # --- 1. AWS S3 SECTION ---
    # Initialize S3 client using default session credentials
    s3_client = boto3.client('s3', region_name="us-east-1")
    
    # Locate the dynamic bucket created in previous steps
    bucket_name = get_lab_bucket(s3_client)
    
    if not bucket_name:
        print("❌ Aborting: AWS Bucket not found. Please run s3_manager.py first.")
        return

    # Extract content from the 'confidential_data.txt' file in S3
    cloud_data = read_file_content(s3_client, bucket_name)
    
    if not cloud_data:
        print("❌ Aborting: Could not read data from S3.")
        return

    # --- 2. SALESFORCE SECTION ---
    # Authenticate using our custom Hybrid REST Handshake
    sf = get_salesforce_connection()
    
    if not sf:
        print("❌ Aborting: Salesforce connection failed.")
        return

    try:
        print("📝 Creating a record in Salesforce with AWS data...")
        
        # Create a 'Case' record to log the cross-cloud synchronization
        new_case = sf.Case.create({
            'Subject': 'AWS S3 Cloud Sync - Week 1',
            'Description': f"Data retrieved from S3: {cloud_data}",
            'Status': 'New',
            'Origin': 'Web',
            'Priority': 'High'
        })
        
        print(f"✅ Success! Case created with ID: {new_case['id']}")
        print("🏁 Phase 1 Complete: The bridge between AWS and Salesforce is active.")

    except Exception as e:
        print(f"❌ Salesforce Error: {e}")

if __name__ == "__main__":
    run_integration()