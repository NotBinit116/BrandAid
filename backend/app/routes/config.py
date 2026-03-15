from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.user import User
from app.models.brand import Brand
from app.models.keyword import BrandKeyword
from app.models.handle import BrandHandle
from app.models.platform import Platform
from app.schemas.config_schema import KeywordCreate, KeywordResponse, HandleCreate, HandleResponse
from app.schemas.platform_schema import PlatformResponse
from app.services.security import get_current_user

router = APIRouter()


# ── Helper: verify brand belongs to current user ─────────────
def get_user_brand(brand_id: int, user_id: int, db: Session) -> Brand:
    brand = db.query(Brand).filter(
        Brand.id == brand_id,
        Brand.user_id == user_id
    ).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


# ── Platforms ────────────────────────────────────────────────
@router.get("/platforms", response_model=List[PlatformResponse])
def get_platforms(db: Session = Depends(get_db)):
    return db.query(Platform).filter(Platform.enabled == True).all()


# ── Keywords ─────────────────────────────────────────────────
@router.get("/{brand_id}/keywords", response_model=List[KeywordResponse])
def get_keywords(
    brand_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_brand(brand_id, current_user.id, db)
    return db.query(BrandKeyword).filter(BrandKeyword.brand_id == brand_id).all()


@router.post("/{brand_id}/keywords", response_model=KeywordResponse, status_code=201)
def add_keyword(
    brand_id: int,
    keyword: KeywordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_brand(brand_id, current_user.id, db)

    existing = db.query(BrandKeyword).filter(
        BrandKeyword.brand_id == brand_id,
        BrandKeyword.keyword == keyword.keyword
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Keyword already exists")

    new_kw = BrandKeyword(
        brand_id=brand_id,
        keyword=keyword.keyword,
        keyword_type=keyword.keyword_type
    )
    db.add(new_kw)
    db.commit()
    db.refresh(new_kw)
    return new_kw


@router.delete("/{brand_id}/keywords/{keyword_id}", status_code=204)
def delete_keyword(
    brand_id: int,
    keyword_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_brand(brand_id, current_user.id, db)
    kw = db.query(BrandKeyword).filter(
        BrandKeyword.id == keyword_id,
        BrandKeyword.brand_id == brand_id
    ).first()
    if not kw:
        raise HTTPException(status_code=404, detail="Keyword not found")
    db.delete(kw)
    db.commit()


# ── Handles ──────────────────────────────────────────────────
@router.get("/{brand_id}/handles", response_model=List[HandleResponse])
def get_handles(
    brand_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_brand(brand_id, current_user.id, db)
    return db.query(BrandHandle).filter(BrandHandle.brand_id == brand_id).all()


@router.post("/{brand_id}/handles", response_model=HandleResponse, status_code=201)
def add_handle(
    brand_id: int,
    handle: HandleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_brand(brand_id, current_user.id, db)

    existing = db.query(BrandHandle).filter(
        BrandHandle.brand_id == brand_id,
        BrandHandle.platform_id == handle.platform_id
    ).first()
    if existing:
        existing.handle = handle.handle
        db.commit()
        db.refresh(existing)
        return existing

    new_handle = BrandHandle(
        brand_id=brand_id,
        platform_id=handle.platform_id,
        handle=handle.handle
    )
    db.add(new_handle)
    db.commit()
    db.refresh(new_handle)
    return new_handle


@router.delete("/{brand_id}/handles/{handle_id}", status_code=204)
def delete_handle(
    brand_id: int,
    handle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    get_user_brand(brand_id, current_user.id, db)
    handle = db.query(BrandHandle).filter(
        BrandHandle.id == handle_id,
        BrandHandle.brand_id == brand_id
    ).first()
    if not handle:
        raise HTTPException(status_code=404, detail="Handle not found")
    db.delete(handle)
    db.commit()
