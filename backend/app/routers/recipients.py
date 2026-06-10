from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..auth import require_admin

router = APIRouter(prefix="/recipients", tags=["Recipients"])


@router.get("/", response_model=List[schemas.RecipientResponse])
def list_recipients(db: Session = Depends(get_db)):
    return db.query(models.Recipient).filter(models.Recipient.active == True).all()


@router.post("/", response_model=schemas.RecipientResponse)
def create_recipient(body: schemas.RecipientCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    r = models.Recipient(**body.model_dump())
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@router.put("/{recipient_id}", response_model=schemas.RecipientResponse)
def update_recipient(recipient_id: int, body: schemas.RecipientUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    r = db.query(models.Recipient).filter(models.Recipient.id == recipient_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recipient not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return r


@router.delete("/{recipient_id}")
def delete_recipient(recipient_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    r = db.query(models.Recipient).filter(models.Recipient.id == recipient_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Recipient not found")
    r.active = False
    db.commit()
    return {"detail": "Recipient deactivated"}
