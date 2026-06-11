import io
import os
import traceback
import torch
from transformers import pipeline
from PIL import Image

type_classifier = None
freshness_classifier = None

# Confidence threshold to reject non-fruit images
CONFIDENCE_THRESHOLD = float(os.getenv("HF_CONFIDENCE_THRESHOLD", "0.35"))

def load_model():
    global type_classifier, freshness_classifier
    hf_token = os.getenv("HF_TOKEN")
    
    # 1. Model for Fruit Type (ResNet-50, 36 classes)
    try:
        print("Loading fruit type model: jazzmacedo/fruits-and-vegetables-detector-36...")
        type_classifier = pipeline(
            "image-classification",
            model="jazzmacedo/fruits-and-vegetables-detector-36",
            token=hf_token,
            device=-1,
        )
        print("✅ Fruit type model loaded successfully")
    except Exception as e:
        print(f"❌ Failed to load fruit type model: {e}")
        print(f"   Traceback: {traceback.format_exc()}")

    # 2. Model for Freshness (ViT) — REMOVED FOR 2GB RAM COMPATIBILITY
    # We now rely entirely on Gemini Vision for freshness detection
    # to save ~800MB of RAM.
    
    # Summary
    if type_classifier is not None:
        print("✅ Light model loaded — freshness will use Gemini fallback")
    else:
        print("🚨 CRITICAL: No models could be loaded! /detect will rely entirely on Gemini Vision.")
        _log_system_resources()


def _log_system_resources():
    """Log system resource info to help diagnose model loading failures."""
    try:
        import shutil
        disk = shutil.disk_usage("/")
        print(f"   💾 Disk: {disk.free / (1024**3):.1f} GB free / {disk.total / (1024**3):.1f} GB total")
    except Exception:
        pass
    try:
        import psutil
        mem = psutil.virtual_memory()
        print(f"   🧠 RAM: {mem.available / (1024**3):.1f} GB free / {mem.total / (1024**3):.1f} GB total")
    except ImportError:
        pass


def detect_freshness(image_bytes: bytes) -> dict:
    """Detect fruit type and freshness with graceful single-model fallback."""
    
    # Both models missing — can't do anything locally
    if type_classifier is None and freshness_classifier is None:
        return {
            "status": "NEEDS_GEMINI",
            "confidence": 0.0,
            "fruit_type": "unknown",
            "is_fruit": True,  # Give benefit of doubt — let Gemini decide
            "all_scores": [],
        }
    
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # ── Step 1: Detect fruit type ──
        fruit_type = "unknown"
        type_score = 0.0
        all_scores = []
        
        if type_classifier is not None:
            type_results = type_classifier(image, top_k=3)
            top_type = type_results[0]
            fruit_type = top_type['label'].lower().replace("fresh", "").replace("rotten", "").strip().strip("_- ")
            type_score = top_type['score']
            all_scores = [{"label": r["label"], "score": round(r["score"], 4)} for r in type_results]
            
            # Check if it's actually a fruit
            if type_score < CONFIDENCE_THRESHOLD:
                print(f"⚠️ Low confidence ({type_score:.2%}) for '{fruit_type}' — likely not a fruit")
                return {
                    "status": "UNKNOWN",
                    "confidence": float(type_score),
                    "fruit_type": "unknown",
                    "is_fruit": False,
                    "all_scores": all_scores,
                }
        
        # ── Step 2: Detect freshness ──
        if freshness_classifier is not None:
            freshness_results = freshness_classifier(image, top_k=2)
            top_freshness = freshness_results[0]
            status_label = top_freshness['label'].lower()
            freshness_score = top_freshness['score']
            
            # Average the confidence (use type_score only if type model was available)
            if type_classifier is not None:
                final_confidence = (type_score + freshness_score) / 2
            else:
                final_confidence = freshness_score
            
            if "rotten" in status_label:
                status = "ROTTEN"
            elif "fresh" in status_label:
                status = "FRESH"
            else:
                status = "NEEDS_GEMINI"
                
            print(f"🍎 Result: {status} {fruit_type} (Type Conf: {type_score:.2%}, Fresh Conf: {freshness_score:.2%})")
                
            return {
                "status": status,
                "confidence": float(final_confidence),
                "fruit_type": fruit_type,
                "is_fruit": True,
                "all_scores": all_scores,
            }
        else:
            # Only type model available — delegate freshness to Gemini
            print(f"🍎 Type detected: {fruit_type} ({type_score:.2%}), freshness model unavailable → Gemini")
            return {
                "status": "NEEDS_GEMINI",
                "confidence": float(type_score),
                "fruit_type": fruit_type,
                "is_fruit": True,
                "all_scores": all_scores,
            }
            
    except Exception as e:
        print(f"Inference error: {e}")
        print(f"   Traceback: {traceback.format_exc()}")
        return {
            "status": "NEEDS_GEMINI",
            "confidence": 0.0,
            "fruit_type": "unknown",
            "is_fruit": True,  # Give benefit of doubt
            "all_scores": [],
        }