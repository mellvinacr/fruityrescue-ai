import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, users, fruits, allocations, donations, dashboard, recipients
from . import schemas
import google.generativeai as genai

from fastapi.staticfiles import StaticFiles
import os

os.makedirs("static/uploads", exist_ok=True)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FruityRescue AI Backend API")

@app.on_event("startup")
def seed_admin_user():
    from .database import SessionLocal
    from . import models
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(models.User).filter(models.User.email == "admin@fruityrescue.com").first()
        if not admin:
            # Seed default admin and other sample data
            print("Seeding default admin user...")
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            hashed_password = pwd_context.hash("admin123")
            
            new_admin = models.User(
                name="Admin FruityRescue",
                email="admin@fruityrescue.com",
                password_hash=hashed_password,
                role="admin"
            )
            db.add(new_admin)
            db.commit()
            print("Admin user seeded successfully!")
    except Exception as e:
        print("Failed to seed database:", e)
    finally:
        db.close()

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(fruits.router)
app.include_router(allocations.router)
app.include_router(donations.router)
app.include_router(dashboard.router)
app.include_router(recipients.router)

# ── Gemini Chat Endpoint ──
GEMINI_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
CHAT_MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"]
if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)
else:
    CHAT_MODELS = []  # No models available without key

SYSTEM_PROMPT = (
    "Kamu adalah asisten FruityRescue AI yang ramah dan berpengetahuan. "
    "Bantu pengguna tentang: cara donasi buah, jenis buah yang bisa didonasikan, "
    "info penerima manfaat, cara pengomposan, edukasi SDGs 2 & 12, manfaat ekonomi sirkular. "
    "Jawab dalam Bahasa Indonesia, ramah, dan ringkas (maksimal 3 kalimat)."
)


@app.post("/chat", response_model=schemas.ChatResponse)
def chat_endpoint(body: schemas.ChatRequest):
    if not CHAT_MODELS:
        return {"reply": "Maaf, layanan chat sedang tidak tersedia."}
    history_text = "\n".join(f"{m.role}: {m.content}" for m in body.history)
    full_prompt = f"{SYSTEM_PROMPT}\n\n{history_text}\nuser: {body.message}\nassistant:"
    
    last_error = None
    for model_name in CHAT_MODELS:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(full_prompt)
            return {"reply": response.text.strip()}
        except Exception as e:
            last_error = e
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
                continue  # Try next model
            return {"reply": f"Maaf, terjadi kesalahan: {str(e)}"}
    
    return {"reply": f"Maaf, semua model sedang penuh quota. Silakan coba lagi nanti."}


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "backend"}
