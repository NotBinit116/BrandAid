from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class ReportCreate(BaseModel):
    brand_id: int
    report_name: str
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    filter_platform: Optional[str] = "All"
    filter_sentiment: Optional[str] = "All"
    filter_risk_level: Optional[str] = "All"


class ReportResponse(BaseModel):
    id: int
    user_id: int
    brand_id: int
    report_name: str
    date_from: Optional[date]
    date_to: Optional[date]
    filter_platform: Optional[str]
    filter_sentiment: Optional[str]
    filter_risk_level: Optional[str]
    file_path: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
