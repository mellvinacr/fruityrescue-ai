# FruityRescue AI - Architecture

This project utilizes a distributed, multi-cloud setup to ensure scalability, resilience, and vendor flexibility.

## 4 VPC Setup

The system is logically partitioned into 4 VPCs (or distinct networked zones in production):
- **Frontend VPC**: EC2 instances running the Next.js 14 application on port 3000.
- **Backend VPC**: EC2 instances running the FastAPI main service, Redis, and Celery workers on port 8000.
- **Database VPC**: Isolated RDS PostgreSQL instance on port 5432, accessible only by the Backend VPC.
- **AI Service VPC**: EC2 instances with GPU/High CPU running the HuggingFace model and interacting with Gemini API on port 8001.

## Multi-Cloud Design

The platform embraces a multi-cloud strategy to optimize costs and reliability:
- **AWS**: Primary cloud provider for compute and structured data.
  - Compute: EC2 instances for Frontend, Backend, and AI Service.
  - Database: RDS for PostgreSQL.
  - Container Registry: ECR.
  - CDN: CloudFront for global caching of frontend assets.
- **GCP (Google Cloud Platform)**: 
  - Object Storage: Google Cloud Storage bucket used specifically to store unstructured data (surplus fruit photos).

## Network Diagram

```
[Internet] --> [AWS CloudFront] --> [Frontend VPC (Next.js)]
                                          |
                                          v
                                [Backend VPC (FastAPI, Redis)]
                                   /      |      \
                                 /        |        \
[GCP Cloud Storage (Photos)] <--          |         --> [AI Service VPC (FastAPI + PyTorch)]
                                          |                         |
                                          v                         v
                           [Database VPC (RDS PostgreSQL)]       [Gemini API]
```
