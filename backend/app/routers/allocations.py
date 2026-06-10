from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/allocations", tags=["Allocations"])

@router.post("/", response_model=schemas.AllocationResponse)
def create_allocation(allocation: schemas.AllocationCreate, db: Session = Depends(get_db)):
    db_allocation = models.Allocation(**allocation.model_dump())
    db.add(db_allocation)
    db.commit()
    db.refresh(db_allocation)
    return db_allocation

@router.get("/", response_model=List[schemas.AllocationResponse])
def get_allocations(db: Session = Depends(get_db)):
    return db.query(models.Allocation).all()
