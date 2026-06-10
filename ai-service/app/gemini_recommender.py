import os
import json
import time
import google.generativeai as genai
import typing_extensions as typing
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"))

# Model priority order (by free-tier quota)
RECOMMENDER_MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"]


def _call_gemini_with_retry(model_name: str, prompt: str, max_retries: int = 3) -> str:
    """Call Gemini API with exponential backoff retry on rate-limit (429) errors."""
    model = genai.GenerativeModel(model_name)
    last_error = None
    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            last_error = e
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
                wait_time = (2 ** attempt) * 2  # 2s, 4s, 8s
                print(f"⏳ Gemini rate-limited on {model_name} (attempt {attempt+1}/{max_retries}), retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise
    raise last_error


def get_recommendation(fruit_type: str, confidence: float) -> dict:
    """
    Called only when fruit is detected as ROTTEN.
    Returns recommendation: 'livestock' or 'compost' with reason in Indonesian.
    """
    prompt = f"""Buah jenis '{fruit_type}' terdeteksi BUSUK dengan tingkat keyakinan {confidence:.0%}.

Sebagai ahli pengelolaan limbah makanan, tentukan alokasi terbaik:
- 'livestock': jika buah masih memiliki nilai gizi untuk hewan ternak
- 'compost': jika buah terlalu rusak dan lebih baik dijadikan pupuk organik

Balas HANYA dengan JSON valid, tanpa markdown, tanpa penjelasan tambahan:
{{"recommendation": "livestock" atau "compost", "reason": "satu kalimat alasan dalam Bahasa Indonesia"}}"""

    try:
        # Try each model in priority order
        last_error = None
        for model_name in RECOMMENDER_MODELS:
            try:
                print(f"🔄 Recommender: trying {model_name}...")
                text = _call_gemini_with_retry(model_name, prompt)
                print(f"✅ Recommender succeeded with {model_name}")
                break
            except Exception as e:
                last_error = e
                print(f"⚠️ Recommender failed with {model_name}: {e}")
                continue
        else:
            raise last_error

        # Clean markdown if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        result = json.loads(text.strip())
        # Validate keys exist
        if "recommendation" not in result or "reason" not in result:
            raise ValueError("Invalid response structure")
        return result
    except Exception as e:
        print(f"Gemini API error: {e}")
        return {
            "recommendation": "compost",
            "reason": "Tidak dapat memproses rekomendasi, default ke pupuk kompos."
        }
