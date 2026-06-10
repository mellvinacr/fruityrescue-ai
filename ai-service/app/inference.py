import io
import os
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

    # 2. Model for Freshness (ViT, binary: fresh vs rotten)
    try:
        print("Loading freshness model: melispsp/fresh_rotten...")
        freshness_classifier = pipeline(
            "image-classification",
            model="melispsp/fresh_rotten",
            token=hf_token,
            device=-1,
        )
        print("✅ Freshness model loaded successfully")
    except Exception as e:
        print(f"❌ Failed to load freshness model: {e}")

    if type_classifier is None and freshness_classifier is None:
        print("🚨 CRITICAL: No models could be loaded! /detect will return UNKNOWN.")

def detect_freshness(image_bytes: bytes) -> dict:
    if type_classifier is None or freshness_classifier is None:
        return {
            "status": "UNKNOWN",
            "confidence": 0.0,
            "fruit_type": "unknown",
            "is_fruit": False,
            "all_scores": [],
        }
    
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # 1. Detect fruit type
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

        # 2. Detect freshness
        freshness_results = freshness_classifier(image, top_k=2)
        top_freshness = freshness_results[0]
        status_label = top_freshness['label'].lower()
        freshness_score = top_freshness['score']
        
        # Average the confidence
        final_confidence = (type_score + freshness_score) / 2
        
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
    except Exception as e:
        print(f"Inference error: {e}")
        return {
            "status": "UNKNOWN",
            "confidence": 0.0,
            "fruit_type": "unknown",
            "is_fruit": False,
            "all_scores": [],
        }