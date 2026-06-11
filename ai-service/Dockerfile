FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies (CPU-only PyTorch)
COPY requirements.txt .
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt

# Pre-download the HF model at BUILD time so startup is instant
ENV HF_HOME=/app/hf_cache
RUN python -c "\
from transformers import pipeline; \
print('Downloading type model (Lightweight ResNet-50)...'); \
pipeline('image-classification', model='jazzmacedo/fruits-and-vegetables-detector-36'); \
print('Model cached successfully. Freshness model removed for 2GB RAM compatibility.')"

# Copy application code
COPY . .

EXPOSE 8001

# Increased timeout for slow CPU inference
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--timeout-keep-alive", "120"]
