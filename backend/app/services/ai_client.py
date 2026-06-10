import httpx
import os

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://ai-service:8001")

async def detect_fruit(image_bytes: bytes, filename: str) -> dict:
    url = f"{AI_SERVICE_URL}/detect"
    
    files = {'file': (filename, image_bytes, 'image/jpeg')}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, files=files, timeout=120.0)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {
                "status": "ROTTEN", # Defaulting if it fails
                "confidence": 0.0,
                "fruit_type": "unknown",
                "recommendation": "compost",
                "reason": f"AI service error: {str(e)}"
            }
