import os
import uuid
from google.cloud import storage

GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")
BACKEND_PUBLIC_URL = os.getenv("BACKEND_PUBLIC_URL", "http://localhost:8000")

def upload_photo(file_bytes: bytes, filename: str, content_type: str) -> str:
    unique_filename = f"{uuid.uuid4()}_{filename}"
    
    # Check if a real GCS bucket is configured
    if GCS_BUCKET_NAME and GCS_BUCKET_NAME != "test-bucket" and os.path.exists(os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")):
        try:
            client = storage.Client()
            bucket = client.bucket(GCS_BUCKET_NAME)
            blob = bucket.blob(unique_filename)
            blob.upload_from_string(file_bytes, content_type=content_type)
            blob.make_public()
            return blob.public_url
        except Exception as e:
            print(f"GCS Upload failed, falling back to local: {e}")

    # Fallback: Save photo locally inside static/uploads/
    local_dir = "static/uploads"
    os.makedirs(local_dir, exist_ok=True)
    local_path = os.path.join(local_dir, unique_filename)
    
    with open(local_path, "wb") as f:
        f.write(file_bytes)
        
    return f"{BACKEND_PUBLIC_URL}/static/uploads/{unique_filename}"
