from pydantic import BaseModel
from typing import Optional


# ── Keywords ────────────────────────────────────────────────
class KeywordCreate(BaseModel):
    keyword: str
    keyword_type: Optional[str] = "monitor"   # "monitor" | "risk"


class KeywordResponse(BaseModel):
    id: int
    brand_id: int
    keyword: str
    keyword_type: Optional[str]

    class Config:
        from_attributes = True


# ── Handles ─────────────────────────────────────────────────
class HandleCreate(BaseModel):
    platform_id: int
    handle: str


class HandleResponse(BaseModel):
    id: int
    brand_id: int
    platform_id: int
    handle: str

    class Config:
        from_attributes = True
