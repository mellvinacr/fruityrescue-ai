import os
import json
import google.generativeai as genai
import typing_extensions as typing
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

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
        response = model.generate_content(prompt)
        text = response.text.strip()
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
