# Deployment Guide

Follow these steps to deploy FruityRescue AI to production.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/fruityrescue-ai.git
   cd fruityrescue-ai
   ```

2. **Setup Environment Variables**:
   Copy `.env.example` to `.env` and fill in your actual credentials.
   Required variables include `DATABASE_URL`, `GCS_BUCKET_NAME`, `GOOGLE_APPLICATION_CREDENTIALS`, and `GEMINI_API_KEY`.

3. **GCP Service Account**:
   Place your `gcs-key.json` securely in the project root (ensure it matches the `GOOGLE_APPLICATION_CREDENTIALS` path).

4. **AWS EC2 Setup**:
   Launch an Ubuntu 22.04 t2.medium instance.
   Ensure Security Groups allow inbound traffic on ports 22 (SSH), 80/443 (HTTP/HTTPS), 3000 (Frontend), 8000 (Backend API), and 8001 (AI Service).

5. **AWS RDS Database**:
   Launch a PostgreSQL 15 database instance. Use the connection string as your `DATABASE_URL`.

6. **AWS ECR Repositories**:
   Create 3 repositories:
   - `fruityrescue-frontend`
   - `fruityrescue-backend`
   - `fruityrescue-ai-service`

7. **Deploy via Docker Compose**:
   ```bash
   docker-compose up --build -d
   ```

8. **CloudFront**:
   Create an AWS CloudFront distribution pointing to the EC2 instance's port 3000 to enable CDN caching and HTTPS.
