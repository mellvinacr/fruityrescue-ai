from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from .. import models, schemas
from ..database import get_db
from ..services.gcs_service import upload_photo
from ..services.ai_client import detect_fruit
from ..auth import get_current_user, get_optional_user

router = APIRouter(prefix="/fruits", tags=["Fruits"])


@router.post("/upload", response_model=schemas.FruitResponse)
async def upload_fruit(
    file: UploadFile = File(...),
    donor_name: str = Form(""),
    contact: str = Form(""),
    location: str = Form(""),
    quantity_kg: float = Form(0),
    notes: str = Form(""),
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    # Resolve donor info
    donor_id = current_user.id if current_user else None
    name = current_user.name if current_user else donor_name
    phone = contact

    # Upload photo to GCS
    file_bytes = await file.read()
    try:
        photo_url = upload_photo(file_bytes, file.filename, file.content_type)
    except Exception:
        photo_url = None

    # Create fruit record (pending)
    fruit = models.Fruit(
        donor_id=donor_id,
        donor_name=name,
        contact=phone,
        location=location,
        photo_url=photo_url,
        quantity_kg=quantity_kg,
        notes=notes,
        status="pending",
    )
    db.add(fruit)
    db.commit()
    db.refresh(fruit)

    # Call AI service
    ai_result = await detect_fruit(file_bytes, file.filename)

    status_str = ai_result.get("status", "ROTTEN").upper()
    fruit.status = "fresh" if status_str == "FRESH" else "rotten"
    fruit.ai_confidence = ai_result.get("confidence")
    fruit.fruit_name = ai_result.get("fruit_name") or ai_result.get("fruit_type")
    fruit.freshness_score = ai_result.get("freshness_score")
    fruit.estimated_days = ai_result.get("estimated_days_remaining")
    fruit.visual_condition = ai_result.get("visual_condition")
    fruit.quick_recommendation = ai_result.get("quick_recommendation")
    fruit.storage_tips = ai_result.get("storage_tips")
    fruit.ai_recommendation = ai_result.get("recommendation")
    fruit.ai_reason = ai_result.get("reason")
    db.commit()

    # Find matching recipient and create allocation
    alloc_type = "orphanage" if fruit.status == "fresh" else (fruit.ai_recommendation or "compost")
    recipient = (
        db.query(models.Recipient)
        .filter(models.Recipient.type == alloc_type, models.Recipient.active == True)
        .first()
    )
    allocation = models.Allocation(
        fruit_id=fruit.id,
        recipient_id=recipient.id if recipient else None,
        allocation_type=alloc_type,
        notes=f"Auto-allocated: {fruit.ai_reason or 'N/A'}",
    )
    db.add(allocation)
    db.commit()
    db.refresh(fruit)

    return fruit


@router.get("/", response_model=List[schemas.FruitResponse])
def get_fruits(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Fruit).order_by(models.Fruit.created_at.desc())
    if status:
        query = query.filter(models.Fruit.status == status)
    return query.all()


@router.get("/my-stats")
def my_stats(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    fruits = db.query(models.Fruit).filter(models.Fruit.donor_id == current_user.id)
    total = fruits.count()
    total_kg = fruits.with_entities(func.sum(models.Fruit.quantity_kg)).scalar() or 0
    fresh = fruits.filter(models.Fruit.status == "fresh").count()
    rotten = fruits.filter(models.Fruit.status == "rotten").count()
    helped = (
        db.query(func.count(func.distinct(models.Allocation.recipient_id)))
        .join(models.Fruit)
        .filter(models.Fruit.donor_id == current_user.id)
        .scalar()
    ) or 0
    return {
        "total_donations": total,
        "total_kg": float(total_kg),
        "fresh_count": fresh,
        "rotten_count": rotten,
        "co2_saved_kg": round(float(total_kg) * 2.5, 1),
        "recipients_helped": helped,
    }


@router.get("/{fruit_id}", response_model=schemas.FruitResponse)
def get_fruit(fruit_id: int, db: Session = Depends(get_db)):
    fruit = db.query(models.Fruit).filter(models.Fruit.id == fruit_id).first()
    if not fruit:
        raise HTTPException(status_code=404, detail="Fruit not found")
    return fruit
