import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 💡 MEMBACA DARI ENVIRONMENT VARIABLES YANG DIKIRIM DOCKER
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "fruitypassword123")
DB_HOST = os.getenv("DB_HOST", "localhost")  # Jika di AWS, ini akan otomatis diganti ke RDS
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "fruityrescue")

# Satukan menjadi URL PostgreSQL yang utuh
SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()