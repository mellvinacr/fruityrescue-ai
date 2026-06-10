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
if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)
    chat_model = genai.GenerativeModel("gemini-2.5-flash")
else:
    chat_model = None

SYSTEM_PROMPT = (
    "Kamu adalah asisten FruityRescue AI yang ramah dan berpengetahuan. "
    "Bantu pengguna tentang: cara donasi buah, jenis buah yang bisa didonasikan, "
    "info penerima manfaat, cara pengomposan, edukasi SDGs 2 & 12, manfaat ekonomi sirkular. "
    "Jawab dalam Bahasa Indonesia, ramah, dan ringkas (maksimal 3 kalimat)."
)


@app.post("/chat", response_model=schemas.ChatResponse)
def chat_endpoint(body: schemas.ChatRequest):
    if not chat_model:
        return {"reply": "Maaf, layanan chat sedang tidak tersedia."}
    history_text = "\n".join(f"{m.role}: {m.content}" for m in body.history)
    full_prompt = f"{SYSTEM_PROMPT}\n\n{history_text}\nuser: {body.message}\nassistant:"
    try:
        response = chat_model.generate_content(full_prompt)
        return {"reply": response.text.strip()}
    except Exception as e:
        return {"reply": f"Maaf, terjadi kesalahan: {str(e)}"}


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "backend"}
