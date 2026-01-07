import boto3
import os
import uuid

# Configuration
# We use UUID to ensure the bucket name is globally UNIQUE (AWS requirement)
BUCKET_NAME = f"lab-archi-week1-{uuid.uuid4().hex[:6]}"
REGION = "us-east-1"
FILE_NAME = "confidential_data.txt"

def create_dummy_file():
    """Creates a local text file to test the upload process"""
    with open(FILE_NAME, "w") as f:
        f.write("Secret Content: The upload worked! 🚀")
    print(f"📄 Local file '{FILE_NAME}' created.")

def create_bucket(s3_client):
    """Creates the Bucket in AWS S3"""
    try:
        print(f"📦 Creating bucket: {BUCKET_NAME}...")
        s3_client.create_bucket(Bucket=BUCKET_NAME)
        print("✅ Bucket created successfully!")
        return True
    except Exception as e:
        print(f"❌ Error creating bucket: {e}")
        return False

def upload_file(s3_client):
    """Uploads the file to the cloud"""
    try:
        print(f"⬆️ Uploading '{FILE_NAME}' to AWS...")
        # Parameters: (Local File Name, Bucket Name, Cloud File Name)
        s3_client.upload_file(FILE_NAME, BUCKET_NAME, FILE_NAME)
        print("✅ Upload completed successfully!")
    except Exception as e:
        print(f"❌ Error during upload: {e}")

def main():
    # 1. Initialize S3 client (uses the credentials configured via AWS CLI)
    s3 = boto3.client('s3', region_name=REGION)
    
    # 2. Create the test file
    create_dummy_file()
    
    # 3. Create Bucket and Upload
    if create_bucket(s3):
        upload_file(s3)
        print("-" * 30)
        print("🎉 MISSION ACCOMPLISHED! Check your AWS Console.")

if __name__ == "__main__":
    main()