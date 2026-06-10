import io
import os
import torch
from transformers import pipeline
from PIL import Image

classifier = None

# Confidence threshold: if the top prediction score is below this,
# the image is likely NOT a fruit/vegetable and should be rejected early.
# This prevents wasting Gemini API quota on non-fruit images.
CONFIDENCE_THRESHOLD = float(os.getenv("HF_CONFIDENCE_THRESHOLD", "0.40"))

def load_model():
    global classifier
    hf_token = os.getenv("HF_TOKEN")
    
    # Model with fresh/rotten labels (e.g. "freshapples", "rottenapples", etc.)
    # This model outputs labels like "freshapples", "rottenapples", "freshbanana",
    # "rottenbanana", etc. — enabling the inference code to determine BOTH the
    # fruit type AND its freshness status from a single HuggingFace call.
    primary_models = [
        "dima806/fruit_vegetable_image_detection",   # ViT-based, 36 classes including fresh/rotten
        "jazzmacedo/fruits-and-vegetables-detector-36",  # Fallback: ResNet-50, type-only
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
            # Quick check: see what labels this model supports
            labels = []
            if hasattr(classifier.model, 'config') and hasattr(classifier.model.config, 'id2label'):
                labels = list(classifier.model.config.id2label.values())
                print(f"  Model labels ({len(labels)}): {labels[:10]}{'...' if len(labels) > 10 else ''}")
                has_freshness = any('fresh' in l.lower() or 'rotten' in l.lower() for l in labels)
                print(f"  Has fresh/rotten labels: {has_freshness}")
            print(f"✅ Model loaded successfully: {model_name}")
            return
        except Exception as e:
            print(f"❌ Failed to load {model_name}: {e}")
    
    print("🚨 CRITICAL: No model could be loaded! /detect will return UNKNOWN.")

def detect_freshness(image_bytes: bytes) -> dict:
    if classifier is None:
        return {
            "status": "UNKNOWN",
            "confidence": 0.0,
            "fruit_type": "unknown",
            "is_fruit": False,
            "all_scores": [],
        }
    
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        results = classifier(image, top_k=5)  # Get top 5 predictions
        
        top_result = results[0]
        label = top_result['label'].lower()
        score = top_result['score']
        
        # Build a summary of all top predictions for logging
        all_scores = [{"label": r["label"], "score": round(r["score"], 4)} for r in results]
        
        # ── Confidence gate: reject non-fruit images ──
        # If the model is not confident about ANY classification, this is likely
        # not a fruit/vegetable image at all.
        if score < CONFIDENCE_THRESHOLD:
            print(f"⚠️ Low confidence ({score:.2%}) for top label '{label}' — likely not a fruit")
            return {
                "status": "UNKNOWN",
                "confidence": float(score),
                "fruit_type": "unknown",
                "is_fruit": False,
                "all_scores": all_scores,
            }

        # ── Parse fresh/rotten from label ──
        # Models may use formats like:
        #   "freshapples", "rottenapples" (no separator)
        #   "fresh apple", "rotten apple" (space separator)
        #   "fresh_apple", "rotten_apple" (underscore)
        label_lower = label.lower().replace("_", " ").replace("-", " ")
        
        if "rotten" in label_lower:
            status = "ROTTEN"
        elif "fresh" in label_lower:
            status = "FRESH"
        else:
            # Model doesn't have fresh/rotten in labels (type-only model)
            # Mark as requiring Gemini analysis
            status = "NEEDS_GEMINI"
        
        # Extract fruit type by removing fresh/rotten prefixes
        fruit_type = label_lower
        for prefix in ["fresh", "rotten"]:
            fruit_type = fruit_type.replace(prefix, "")
        fruit_type = fruit_type.strip().strip("_- ")
        if not fruit_type:
            fruit_type = "unknown"
            
        return {
            "status": status,
            "confidence": float(score),
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