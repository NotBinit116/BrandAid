from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.database.connection import get_db
from app.models.user import User
from app.models.brand import Brand
from app.models.author_flag import AuthorFlag
from app.services.security import get_current_user

router = APIRouter()


class AuthorFlagResponse(BaseModel):
    id:             int
    brand_id:       int
    author:         str
    platform:       str
    negative_count: int
    total_count:    int
    negative_ratio: float
    is_flagged:     bool
    flagged_at:     Optional[datetime]
    created_at:     datetime

    class Config:
        from_attributes = True


def verify_brand(brand_id: int, user_id: int, db: Session) -> Brand:
    brand = db.query(Brand).filter(Brand.id == brand_id, Brand.user_id == user_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@router.get("/{brand_id}/flagged", response_model=List[AuthorFlagResponse])
def get_flagged(
    brand_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_brand(brand_id, current_user.id, db)
    return db.query(AuthorFlag).filter(
        AuthorFlag.brand_id   == brand_id,
        AuthorFlag.is_flagged == True,
    ).order_by(AuthorFlag.negative_count.desc()).all()


@router.get("/{brand_id}/all", response_model=List[AuthorFlagResponse])
def get_all_stats(
    brand_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_brand(brand_id, current_user.id, db)
    return db.query(AuthorFlag).filter(
        AuthorFlag.brand_id    == brand_id,
        AuthorFlag.total_count > 1,
    ).order_by(AuthorFlag.negative_count.desc()).all()


@router.post("/{brand_id}/unflag/{flag_id}")
def unflag(
    brand_id: int,
    flag_id:  int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_brand(brand_id, current_user.id, db)
    record = db.query(AuthorFlag).filter(
        AuthorFlag.id == flag_id, AuthorFlag.brand_id == brand_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Flag not found")
    record.is_flagged = False
    record.flagged_at = None
    db.commit()
    return {"success": True}
