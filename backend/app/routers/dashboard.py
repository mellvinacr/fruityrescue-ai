from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import datetime, timedelta
from ..database import get_db
from .. import models

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_fruits = db.query(models.Fruit).count()
    fresh_count = db.query(models.Fruit).filter(models.Fruit.status == "fresh").count()
    rotten_count = db.query(models.Fruit).filter(models.Fruit.status == "rotten").count()
    pending_count = db.query(models.Fruit).filter(models.Fruit.status == "pending").count()
    total_kg = db.query(func.sum(models.Fruit.quantity_kg)).scalar() or 0.0
    co2_saved_kg = round(float(total_kg) * 2.5, 1)

    orphanage_count = db.query(models.Allocation).filter(models.Allocation.allocation_type == "orphanage").count()
    livestock_count = db.query(models.Allocation).filter(models.Allocation.allocation_type == "livestock").count()
    compost_count = db.query(models.Allocation).filter(models.Allocation.allocation_type == "compost").count()
    recipients_helped = (
        db.query(func.count(func.distinct(models.Allocation.recipient_id)))
        .filter(models.Allocation.recipient_id.isnot(None))
        .scalar()
    ) or 0

    # Daily donations for last 7 days
    daily_donations = []
    for i in range(6, -1, -1):
        day = datetime.utcnow().date() - timedelta(days=i)
        day_fruits = db.query(models.Fruit).filter(cast(models.Fruit.created_at, Date) == day)
        count = day_fruits.count()
        fresh_kg = day_fruits.filter(models.Fruit.status == "fresh").with_entities(func.sum(models.Fruit.quantity_kg)).scalar() or 0
        rotten_kg = day_fruits.filter(models.Fruit.status == "rotten").with_entities(func.sum(models.Fruit.quantity_kg)).scalar() or 0
        daily_donations.append({
            "date": day.isoformat(),
            "count": count,
            "fresh_kg": float(fresh_kg),
            "rotten_kg": float(rotten_kg),
        })

    # Recent activity
    recent = (
        db.query(models.Fruit)
        .order_by(models.Fruit.created_at.desc())
        .limit(8)
        .all()
    )
    recent_activity = [
        {
            "donor_name": f.donor_name or "Anonim",
            "fruit_name": f.fruit_name or "Buah",
            "quantity_kg": f.quantity_kg or 0,
            "status": f.status,
            "created_at": f.created_at.isoformat() if f.created_at else None,
        }
        for f in recent
    ]

    return {
        "total_fruits": total_fruits,
        "fresh_count": fresh_count,
        "rotten_count": rotten_count,
        "pending_count": pending_count,
        "total_kg": float(total_kg),
        "co2_saved_kg": co2_saved_kg,
        "orphanage_count": orphanage_count,
        "livestock_count": livestock_count,
        "compost_count": compost_count,
        "recipients_helped": recipients_helped,
        "daily_donations": daily_donations,
        "recent_activity": recent_activity,
    }
