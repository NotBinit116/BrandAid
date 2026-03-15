from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ContentResponse(BaseModel):
    id: int
    brand_id: int
    platform_id: int
    text_content: Optional[str]
    source_url: Optional[str]
    author: Optional[str]
    created_at: Optional[datetime]
    collected_at: datetime

    class Config:
        from_attributes = True


class SentimentResponse(BaseModel):
    id: int
    content_id: int
    sentiment: Optional[str]
    score: Optional[float]
    risk_level: Optional[str]
    analyzed_at: datetime

    class Config:
        from_attributes = True


# Combined flat response for the dashboard feed
class ContentWithSentiment(BaseModel):
    id: int
    text: Optional[str]
    platform: Optional[str]
    source_url: Optional[str]
    author: Optional[str]
    date: Optional[str]
    sentiment: Optional[str]
    score: Optional[float]
    risk_level: Optional[str]

    class Config:
        from_attributes = True
