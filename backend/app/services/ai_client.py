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
        except httpx.ConnectError:
            return _fallback_response(
                "Layanan AI tidak dapat dihubungi. Server AI mungkin sedang restart."
            )
        except httpx.TimeoutException:
            return _fallback_response(
                "Layanan AI membutuhkan waktu terlalu lama. Silakan coba lagi."
            )
        except Exception as e:
            return _fallback_response(
                f"Layanan AI sedang tidak tersedia. Silakan coba lagi nanti."
            )


def _fallback_response(reason: str) -> dict:
    """Return a safe fallback when AI Service is unreachable.
    
    Uses UNKNOWN status instead of ROTTEN so fresh fruit
    is NOT incorrectly marked as rotten.
    """
    return {
        "status": "UNKNOWN",
        "confidence": 0.0,
        "fruit_type": "unknown",
        "fruit_name": "Tidak dapat dideteksi",
        "visual_condition": "AI tidak tersedia untuk menganalisis",
        "freshness_score": None,
        "estimated_days_remaining": None,
        "quick_recommendation": "Silakan coba upload ulang atau periksa buah secara manual",
        "storage_tips": "Simpan di tempat sejuk sambil menunggu analisis ulang",
        "recommendation": "pending",
        "reason": reason,
    }
