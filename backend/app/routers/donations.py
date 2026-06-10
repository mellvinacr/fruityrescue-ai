from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/donations", tags=["Donations"])


@router.get("/", response_model=List[schemas.FruitResponse])
def get_donations(db: Session = Depends(get_db)):
    """List all fruits (donations). Alias for /fruits/."""
    return db.query(models.Fruit).all()
