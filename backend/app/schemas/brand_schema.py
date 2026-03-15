from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BrandCreate(BaseModel):
    brand_name: str


class BrandUpdate(BaseModel):
    brand_name: Optional[str] = None


class BrandResponse(BaseModel):
    id: int
    user_id: int
    brand_name: str
    created_at: datetime

    class Config:
        from_attributes = True
