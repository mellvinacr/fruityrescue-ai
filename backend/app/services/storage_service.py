import os
import uuid
import boto3
from botocore.config import Config

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL")
BACKEND_PUBLIC_URL = os.getenv("BACKEND_PUBLIC_URL", "http://localhost:8000")

def upload_photo(file_bytes: bytes, filename: str, content_type: str) -> str:
    unique_filename = f"{uuid.uuid4()}_{filename}"
    
    # Check if Cloudflare R2 credentials are configured
    if R2_ACCOUNT_ID and R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY and R2_BUCKET_NAME:
        try:
            r2_endpoint = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
            s3_client = boto3.client(
                "s3",
                endpoint_url=r2_endpoint,
                aws_access_key_id=R2_ACCESS_KEY_ID,
                aws_secret_access_key=R2_SECRET_ACCESS_KEY,
                config=Config(signature_version="s3v4")
            )
            
            s3_client.put_object(
                Bucket=R2_BUCKET_NAME,
                Key=unique_filename,
                Body=file_bytes,
                ContentType=content_type
            )
            
            # If R2_PUBLIC_URL is provided, use it. Otherwise, build a default one.
            if R2_PUBLIC_URL:
                public_url_clean = R2_PUBLIC_URL.rstrip("/")
                return f"{public_url_clean}/{unique_filename}"
            else:
                return f"https://{R2_BUCKET_NAME}.{R2_ACCOUNT_ID}.r2.cloudflarestorage.com/{unique_filename}"
                
        except Exception as e:
            print(f"R2 Upload failed, falling back to local: {e}")

    # Fallback: Save photo locally inside static/uploads/
    local_dir = "static/uploads"
    os.makedirs(local_dir, exist_ok=True)
    local_path = os.path.join(local_dir, unique_filename)
    
    with open(local_path, "wb") as f:
        f.write(file_bytes)
        
    return f"{BACKEND_PUBLIC_URL}/static/uploads/{unique_filename}"
