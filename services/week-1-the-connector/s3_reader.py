import boto3

# Configuration
REGION = "us-east-1"
FILE_NAME = "confidential_data.txt"
BUCKET_PREFIX = "lab-archi-week1-"

def get_lab_bucket(s3_client):
    """
    Finds the specific bucket created for this lab.
    It looks for a bucket starting with 'lab-archi-week1-'.
    """
    try:
        print("🔍 Listing buckets to find our lab bucket...")
        response = s3_client.list_buckets()
        
        for bucket in response['Buckets']:
            name = bucket['Name']
            if name.startswith(BUCKET_PREFIX):
                print(f"✅ Found bucket: {name}")
                return name
        
        print("❌ Lab bucket not found!")
        return None
    except Exception as e:
        print(f"❌ Error listing buckets: {e}")
        return None

def read_file_content(s3_client, bucket_name):
    """
    Reads the file content directly from S3 into memory (without saving to disk).
    This is useful for passing data to other APIs (like Salesforce).
    """
    try:
        print(f"📖 Reading '{FILE_NAME}' from S3...")
        
        # get_object returns a stream of bytes
        response = s3_client.get_object(Bucket=bucket_name, Key=FILE_NAME)
        
        # We need to read the bytes and decode them to a string (utf-8)
        content = response['Body'].read().decode('utf-8')
        
        print("-" * 30)
        print("DATA RECEIVED FROM CLOUD:")
        print(content)
        print("-" * 30)
        return content
        
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return None

def main():
    # 1. Initialize S3 client
    s3 = boto3.client('s3', region_name=REGION)
    
    # 2. Find the dynamic bucket name
    bucket_name = get_lab_bucket(s3)
    
    # 3. Read the content
    if bucket_name:
        read_file_content(s3, bucket_name)
    else:
        print("⚠️ Setup incomplete. Please run s3_manager.py first.")

if __name__ == "__main__":
    main()