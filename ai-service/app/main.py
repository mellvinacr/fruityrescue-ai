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
    if inference_module.type_classifier is not None and inference_module.freshness_classifier is not None:
        print("✅ Dual Models loaded successfully")
    elif inference_module.type_classifier is not None or inference_module.freshness_classifier is not None:
        print("⚠️ Partial model load — Gemini Vision will supplement missing capabilities")
    else:
        print("🚨 WARNING: No HF models loaded! /detect will rely entirely on Gemini Vision")
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
                "recommendation": "pending",
                "reason": "Sistem tidak yakin objek ini adalah buah"
            }

        # Layer 2: Gemini Vision analysis
        if status in ("NEEDS_GEMINI", "UNKNOWN"):
            print(f"🤖 Menjalankan Gemini Vision karena HF status adalah {status}...")
            try:
                gemini_analysis = analyze_fruit_image(image_bytes, "UNKNOWN", fruit_type)
                status = gemini_analysis.get("status", "UNKNOWN").upper()
                # Validate status from Gemini
                if status not in ("FRESH", "ROTTEN"):
                    status = "UNKNOWN"
                print(f"✅ Gemini Vision result: status={status}")
            except Exception as e:
                print(f"⚠️ Gemini Vision failed: {e}")
                # Both HF and Gemini failed — return honest UNKNOWN
                from .gemini_vision import translate_fruit_type
                gemini_analysis = {
                    "status": "UNKNOWN",
                    "fruit_name": translate_fruit_type(fruit_type) if fruit_type != "unknown" else "Tidak dapat diidentifikasi",
                    "visual_condition": "AI tidak dapat menganalisis gambar saat ini",
                    "freshness_score": None,
                    "estimated_days_remaining": None,
                    "quick_recommendation": "Silakan coba lagi atau periksa buah secara manual",
                    "storage_tips": "Simpan di tempat sejuk sambil menunggu analisis ulang",
                }
                status = "UNKNOWN"
        else:
            # HF is confident — skip Gemini Vision to save quota
            print(f"⚡ Bypass Gemini Vision, HF sudah yakin statusnya: {status}")
            from .gemini_vision import translate_fruit_type
            score = int(confidence * 100)
            gemini_analysis = {
                "status": status,
                "fruit_name": translate_fruit_type(fruit_type),
                "visual_condition": f"Kondisi fisik terlihat {'segar' if status == 'FRESH' else 'busuk'} dari gambar",
                "freshness_score": score if status == "FRESH" else max(0, 40 - int(confidence * 40)),
                "estimated_days_remaining": 3 if status == "FRESH" else 0,
                "quick_recommendation": "Segera konsumsi atau distribusikan" if status == "FRESH" else "Pisahkan dari buah lain yang segar",
                "storage_tips": "Simpan di kulkas atau tempat sejuk" if status == "FRESH" else "Segera daur ulang untuk mencegah penyebaran jamur"
            }

        # Layer 3: Allocation recommendation
        if status == "ROTTEN":
            reco = get_recommendation(
                gemini_analysis.get("fruit_name", fruit_type), confidence
            )
            recommendation = reco.get("recommendation", "compost")
            reason = reco.get("reason", "Default ke kompos")
        elif status == "FRESH":
            recommendation = "orphanage"
            reason = "Buah segar, cocok untuk konsumsi langsung"
        else:
            # UNKNOWN — don't auto-assign
            recommendation = "pending"
            reason = "Menunggu analisis lebih lanjut"

        return {
            "status": status,
            "confidence": confidence,
            "fruit_type": fruit_type,
            "fruit_name": gemini_analysis.get("fruit_name", fruit_type),
            "visual_condition": gemini_analysis.get("visual_condition", ""),
            "freshness_score": gemini_analysis.get("freshness_score"),
            "estimated_days_remaining": gemini_analysis.get("estimated_days_remaining"),
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
                "fruit_name": "Tidak dapat dideteksi",
                "visual_condition": "Terjadi kesalahan saat menganalisis",
                "freshness_score": None,
                "estimated_days_remaining": None,
                "quick_recommendation": "Silakan coba upload ulang",
                "storage_tips": "-",
                "recommendation": "pending",
                "reason": "Layanan AI mengalami kesalahan internal",
            }
        )


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "ai-service",
        "type_model_loaded": inference_module.type_classifier is not None,
        "freshness_model_loaded": inference_module.freshness_classifier is not None,
        "both_models_loaded": inference_module.type_classifier is not None and inference_module.freshness_classifier is not None,
    }
