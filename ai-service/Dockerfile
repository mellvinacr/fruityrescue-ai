FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies (CPU-only PyTorch)
COPY requirements.txt .
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt

# Model will be downloaded on first startup at runtime to avoid HF 429 rate limits in CI/CD
ENV HF_HOME=/app/hf_cache

# Copy application code
COPY . .

EXPOSE 8001

# Increased timeout for slow CPU inference
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--timeout-keep-alive", "120"]
