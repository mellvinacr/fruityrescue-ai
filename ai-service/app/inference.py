import io
import os
import torch
from transformers import pipeline
from PIL import Image

classifier = None

def load_model():
    global classifier
    hf_token = os.getenv("HF_TOKEN")
    
    # Primary model: ResNet-50 based fruit/vegetable classifier
    primary_models = [
        "jazzmacedo/fruits-and-vegetables-detector-36",  # ResNet-50 based, ~98MB
    ]
    
    for model_name in primary_models:
        try:
            print(f"Loading model: {model_name}...")
            classifier = pipeline(
                "image-classification",
                model=model_name,
                token=hf_token,
                device=-1,  # Force CPU explicitly
            )
            print(f"✅ Model loaded successfully: {model_name}")
            return
        except Exception as e:
            print(f"❌ Failed to load {model_name}: {e}")
    
    print("🚨 CRITICAL: No model could be loaded! /detect will return UNKNOWN.")

def detect_freshness(image_bytes: bytes) -> dict:
    if classifier is None:
        return {"status": "UNKNOWN", "confidence": 0.0, "fruit_type": "unknown"}
    
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        results = classifier(image)
        
        top_result = results[0]
        label = top_result['label'].lower()
        score = top_result['score']
        
        status = "ROTTEN" if "rotten" in label else "FRESH"
        
        fruit_type = label.replace("fresh", "").replace("rotten", "").strip().strip("_- ")
        if not fruit_type:
            fruit_type = "unknown"
            
        return {
            "status": status,
            "confidence": float(score),
            "fruit_type": fruit_type
        }
    except Exception as e:
        print(f"Inference error: {e}")
        return {"status": "UNKNOWN", "confidence": 0.0, "fruit_type": "unknown"}