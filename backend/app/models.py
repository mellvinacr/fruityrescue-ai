from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="donor")
    created_at = Column(DateTime, default=datetime.utcnow)
    fruits = relationship("Fruit", back_populates="donor")


class Recipient(Base):
    __tablename__ = "recipients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)
    address = Column(Text, nullable=False)
    contact = Column(String(50))
    capacity_kg = Column(Float, default=100)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    allocations = relationship("Allocation", back_populates="recipient")


class Fruit(Base):
    __tablename__ = "fruits"
    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id"))
    donor_name = Column(String(100))
    contact = Column(String(50))
    location = Column(Text)
    photo_url = Column(Text)
    quantity_kg = Column(Float)
    notes = Column(Text)
    fruit_name = Column(String(100))
    status = Column(String(20), default="pending")
    ai_confidence = Column(Float)
    freshness_score = Column(Integer)
    estimated_days = Column(Integer)
    visual_condition = Column(Text)
    quick_recommendation = Column(Text)
    storage_tips = Column(Text)
    ai_recommendation = Column(String(20))
    ai_reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    donor = relationship("User", back_populates="fruits")
    allocations = relationship("Allocation", back_populates="fruit")


class Allocation(Base):
    __tablename__ = "allocations"
    id = Column(Integer, primary_key=True, index=True)
    fruit_id = Column(Integer, ForeignKey("fruits.id"))
    recipient_id = Column(Integer, ForeignKey("recipients.id"))
    allocation_type = Column(String(20))
    status = Column(String(20), default="pending")
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    fruit = relationship("Fruit", back_populates="allocations")
    recipient = relationship("Recipient", back_populates="allocations")
