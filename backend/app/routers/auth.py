from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=schemas.AuthResponse)
def register(body: schemas.AuthRegister, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    user = models.User(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password),
        role="donor",  # Always donor; admin accounts are seeded via seed.sql only
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "user": user}


@router.post("/login", response_model=schemas.AuthResponse)
def login(body: schemas.AuthLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email atau password salah")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "user": user}


@router.get("/me", response_model=schemas.UserOut)
def me(current_user=Depends(get_current_user)):
    return current_user
