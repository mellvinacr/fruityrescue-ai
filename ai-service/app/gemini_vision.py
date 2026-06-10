import google.generativeai as genai
import json
import os
import time
from PIL import Image
import io

genai.configure(api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "")

# Model priority order (by free-tier quota):
# - gemini-2.0-flash-lite: 30 RPD, lightest/fastest
# - gemini-2.0-flash:      1500 RPD but sometimes throttled  
# - gemini-2.5-flash:      20 RPD, most capable but lowest quota
VISION_MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"]

TRANSLATION_MAP = {
    'apple': 'Apel',
    'banana': 'Pisang',
    'beetroot': 'Bit',
    'bell pepper': 'Paprika',
    'cabbage': 'Kubis',
    'capsicum': 'Paprika',
    'carrot': 'Wortel',
    'cauliflower': 'Kembang Kol',
    'chilli pepper': 'Cabai',
    'corn': 'Jagung',
    'cucumber': 'Timun',
    'eggplant': 'Terong',
    'garlic': 'Bawang Putih',
    'ginger': 'Jahe',
    'grapes': 'Anggur',
    'jalepeno': 'Jalapeno',
    'kiwi': 'Kiwi',
    'lemon': 'Lemon',
    'lettuce': 'Selada',
    'mango': 'Mangga',
    'onion': 'Bawang Merah/Bombai',
    'orange': 'Jeruk',
    'paprika': 'Paprika',
    'pear': 'Pir',
    'peas': 'Kacang Polong',
    'pineapple': 'Nanas',
    'pomegranate': 'Delima',
    'potato': 'Kentang',
    'raddish': 'Lobak',
    'soy beans': 'Kacang Kedelai',
    'spinach': 'Bayam',
    'sweetcorn': 'Jagung Manis',
    'sweetpotato': 'Ubi Jalar',
    'tomato': 'Tomat',
    'turnip': 'Lobak RRC',
    'watermelon': 'Semangka'
}

def translate_fruit_type(fruit_type: str) -> str:
    if not fruit_type:
        return "Buah tidak teridentifikasi"
    key = fruit_type.lower().strip()
    return TRANSLATION_MAP.get(key, fruit_type.capitalize())


def _call_gemini_with_retry(model_name: str, content: list, max_retries: int = 3) -> str:
    """Call Gemini API with exponential backoff retry on rate-limit (429) errors."""
    model = genai.GenerativeModel(model_name)
    last_error = None
    for attempt in range(max_retries):
        try:
            response = model.generate_content(content)
            return response.text.strip()
        except Exception as e:
            last_error = e
            error_str = str(e)
            # Only retry on rate-limit / quota errors
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
                wait_time = (2 ** attempt) * 2  # 2s, 4s, 8s
                print(f"⏳ Gemini rate-limited on {model_name} (attempt {attempt+1}/{max_retries}), retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                # Non-retryable error, break immediately
                raise
    raise last_error


def analyze_fruit_image(image_bytes: bytes, hf_status: str, fruit_type: str = "unknown") -> dict:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        prompt = f"""Analyze this fruit/vegetable image carefully.
The classifier detected the type as: {fruit_type}

Return ONLY a valid JSON object, no markdown, no explanation:
{{
  "status": "status kesegaran buah, harus bernilai 'FRESH' (segar/bisa dikonsumsi) atau 'ROTTEN' (busuk/tidak layak konsumsi langsung)",
  "fruit_name": "nama buah dalam Bahasa Indonesia (misal: 'Apel', 'Pisang', 'Jeruk')",
  "visual_condition": "deskripsi singkat kondisi visual yang terlihat (maks 15 kata)",
  "freshness_score": <integer 0-100>,
  "estimated_days_remaining": <integer, 0 jika busuk>,
  "quick_recommendation": "satu kalimat rekomendasi tindakan dalam Bahasa Indonesia",
  "storage_tips": "satu tips penyimpanan dalam Bahasa Indonesia"
}}"""

        # Try each model in priority order (2.0-flash first for higher quota)
        last_error = None
        for model_name in VISION_MODELS:
            try:
                print(f"🔍 Gemini Vision: trying {model_name}...")
                text = _call_gemini_with_retry(model_name, [prompt, image])
                print(f"✅ Gemini Vision succeeded with {model_name}")
                break
            except Exception as e:
                last_error = e
                print(f"⚠️ Gemini Vision failed with {model_name}: {e}")
                continue
        else:
            # All models failed
            raise last_error

        # Clean markdown if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        data = json.loads(text.strip())
        
        # Validate status
        if "status" in data:
            data["status"] = data["status"].upper()
            if data["status"] not in ["FRESH", "ROTTEN"]:
                data["status"] = hf_status
        else:
            data["status"] = hf_status
            
        return data
    except Exception as e:
        print(f"Gemini Vision error: {e}")
        return {
            "status": hf_status,
            "fruit_name": translate_fruit_type(fruit_type),
            "visual_condition": "Tidak dapat menganalisis gambar secara detail",
            "freshness_score": 50 if hf_status == "FRESH" else 10,
            "estimated_days_remaining": 3 if hf_status == "FRESH" else 0,
            "quick_recommendation": "Segera periksa kondisi buah secara manual",
            "storage_tips": "Simpan di tempat sejuk dan kering",
        }
