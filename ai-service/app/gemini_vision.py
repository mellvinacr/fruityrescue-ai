import google.generativeai as genai
import json
import os
from PIL import Image
import io

genai.configure(api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "")
# Use gemini-2.5-flash since gemini-1.5-flash is not supported/found under this API key
vision_model = genai.GenerativeModel("gemini-2.5-flash")

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
        response = vision_model.generate_content([prompt, image])
        text = response.text.strip()
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

