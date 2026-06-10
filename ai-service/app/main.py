from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from .inference import load_model, detect_freshness
from .gemini_recommender import get_recommendation
from .gemini_vision import analyze_fruit_image
import app.inference as inference_module
import traceback


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting AI service — loading model...")
    load_model()
    if inference_module.classifier is not None:
        print("✅ Model loaded successfully")
    else:
        print("🚨 WARNING: Model failed to load! /detect will return UNKNOWN")
    yield
    print("🛑 AI service shutting down")


app = FastAPI(title="FruityRescue AI - AI Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        # Layer 1: HuggingFace classification
        hf_result = detect_freshness(image_bytes)
        status = hf_result["status"]
        confidence = hf_result["confidence"]
        fruit_type = hf_result["fruit_type"]
        is_fruit = hf_result.get("is_fruit", True)

        if not is_fruit:
            return {
                "status": "UNKNOWN",
                "confidence": confidence,
                "fruit_type": "unknown",
                "fruit_name": "Bukan Buah/Sayur",
                "visual_condition": "Objek tidak dikenali sebagai buah atau sayuran",
                "freshness_score": 0,
                "estimated_days_remaining": 0,
                "quick_recommendation": "Silakan unggah foto buah atau sayur yang jelas",
                "storage_tips": "-",
                "recommendation": "compost",
                "reason": "Sistem menolak objek non-buah"
            }

        # Layer 2: Gemini Vision analysis (HANYA JIKA DIBUTUHKAN)
        if status == "NEEDS_GEMINI" or status == "UNKNOWN":
            print(f"🤖 Menjalankan Gemini Vision karena HF status adalah {status}...")
            gemini_analysis = analyze_fruit_image(image_bytes, "UNKNOWN", fruit_type)
            status = gemini_analysis.get("status", "ROTTEN").upper()
        else:
            # Hemat Quota: Gunakan template jika HF sudah yakin statusnya FRESH/ROTTEN
            print(f"⚡ Bypass Gemini Vision, HF sudah yakin statusnya: {status}")
            from .gemini_vision import translate_fruit_type
            score = int(confidence * 100)
            gemini_analysis = {
                "status": status,
                "fruit_name": translate_fruit_type(fruit_type),
                "visual_condition": f"Kondisi fisik terlihat {status.lower()} dari gambar",
                "freshness_score": score if status == "FRESH" else max(0, 40 - int(confidence * 40)),
                "estimated_days_remaining": 3 if status == "FRESH" else 0,
                "quick_recommendation": "Segera konsumsi" if status == "FRESH" else "Pisahkan dari buah lain yang segar",
                "storage_tips": "Simpan di kulkas atau tempat sejuk" if status == "FRESH" else "Segera daur ulang untuk mencegah penyebaran jamur"
            }

        # Layer 3: Allocation recommendation
        if status == "ROTTEN":
            reco = get_recommendation(
                gemini_analysis.get("fruit_name", fruit_type), confidence
            )
            recommendation = reco.get("recommendation", "compost")
            reason = reco.get("reason", "Default ke kompos")
        else:
            recommendation = "orphanage"
            reason = "Buah segar, cocok untuk konsumsi langsung"

        return {
            "status": status,
            "confidence": confidence,
            "fruit_type": fruit_type,
            "fruit_name": gemini_analysis.get("fruit_name", fruit_type),
            "visual_condition": gemini_analysis.get("visual_condition", ""),
            "freshness_score": gemini_analysis.get("freshness_score", 50),
            "estimated_days_remaining": gemini_analysis.get("estimated_days_remaining", 0),
            "quick_recommendation": gemini_analysis.get("quick_recommendation", ""),
            "storage_tips": gemini_analysis.get("storage_tips", ""),
            "recommendation": recommendation,
            "reason": reason,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"🚨 /detect error: {traceback.format_exc()}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "AI inference failed",
                "detail": str(e),
                "status": "UNKNOWN",
                "confidence": 0.0,
                "fruit_type": "unknown",
            }
        )


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ai-service",
        "model_loaded": inference_module.classifier is not None,
    }
