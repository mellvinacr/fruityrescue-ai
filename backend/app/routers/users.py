from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..auth import require_admin

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[schemas.UserOut])
def get_users(db: Session = Depends(get_db), _admin=Depends(require_admin)):
    return db.query(models.User).all()