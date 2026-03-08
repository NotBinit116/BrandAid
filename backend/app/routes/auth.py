from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserResponse
import hashlib

router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):

    hashed_password = hashlib.sha256(user.password.encode()).hexdigest()

    new_user = User(
        email=user.email,
        password_hash=hashed_password,
        role="USER"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user