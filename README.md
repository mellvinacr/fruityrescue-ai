# FruityRescue AI

FruityRescue AI is a circular platform to rescue surplus fruits from stores and farmers, supporting SDGs 2 (Zero Hunger) and SDGs 12 (Responsible Consumption).

## Architecture

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Backend API**: Python FastAPI
- **AI Microservice**: Python FastAPI (for image classification and confidence scoring)
- **Database**: PostgreSQL
- **Object Storage**: AWS S3 (Primary) / Google Cloud Storage (Backup)
- **Containerization**: Docker & Docker Compose
- **Task Queue**: Celery with Redis

## How to Run Locally

1. **Clone the repository**
2. **Setup environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```
3. **Start the services** with Docker Compose:
   ```bash
   docker-compose up -d --build
   ```
4. **Access the applications**:
   - Frontend: `http://localhost:3000`
   - Backend API Docs: `http://localhost:8000/docs`
   - AI Service API Docs: `http://localhost:8001/docs`

## Folder Structure
- `/frontend`: Next.js Web App
- `/backend`: Main FastAPI Service
- `/ai-service`: AI Microservice for Fruit Freshness
- `/database`: Database init scripts
- `/.github/workflows`: CI/CD pipelines
