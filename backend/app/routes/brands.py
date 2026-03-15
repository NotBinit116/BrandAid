from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.user import User
from app.models.brand import Brand
from app.schemas.brand_schema import BrandCreate, BrandUpdate, BrandResponse
from app.services.security import get_current_user

router = APIRouter()


@router.get("/", response_model=List[BrandResponse])
def get_brands(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Brand).filter(Brand.user_id == current_user.id).all()


@router.post("/", response_model=BrandResponse, status_code=201)
def create_brand(
    brand: BrandCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Brand).filter(
        Brand.user_id == current_user.id,
        Brand.brand_name == brand.brand_name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Brand already exists")

    new_brand = Brand(user_id=current_user.id, brand_name=brand.brand_name)
    db.add(new_brand)
    db.commit()
    db.refresh(new_brand)
    return new_brand


@router.get("/{brand_id}", response_model=BrandResponse)
def get_brand(
    brand_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brand = db.query(Brand).filter(
        Brand.id == brand_id,
        Brand.user_id == current_user.id
    ).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@router.put("/{brand_id}", response_model=BrandResponse)
def update_brand(
    brand_id: int,
    data: BrandUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brand = db.query(Brand).filter(
        Brand.id == brand_id,
        Brand.user_id == current_user.id
    ).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    if data.brand_name:
        brand.brand_name = data.brand_name
    db.commit()
    db.refresh(brand)
    return brand


@router.delete("/{brand_id}", status_code=204)
def delete_brand(
    brand_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brand = db.query(Brand).filter(
        Brand.id == brand_id,
        Brand.user_id == current_user.id
    ).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    db.delete(brand)
    db.commit()
