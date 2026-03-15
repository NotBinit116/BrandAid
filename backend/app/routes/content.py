from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database.connection import get_db
from app.models.user import User
from app.models.content import Content
from app.models.sentiment import Sentiment
from app.models.platform import Platform
from app.models.brand import Brand
from app.schemas.content_schema import ContentWithSentiment
from app.services.security import get_current_user

router = APIRouter()


@router.get("/", response_model=List[ContentWithSentiment])
def get_content(
    brand_id: int,
    platform: Optional[str] = Query(None),
    sentiment: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify brand belongs to current user
    brand = db.query(Brand).filter(
        Brand.id == brand_id,
        Brand.user_id == current_user.id
    ).first()
    if not brand:
        return []

    # Join content → sentiment → platform
    query = (
        db.query(Content, Sentiment, Platform)
        .join(Sentiment, Sentiment.content_id == Content.id)
        .join(Platform, Platform.id == Content.platform_id)
        .filter(Content.brand_id == brand_id)
    )

    # Apply filters
    if platform and platform != "All":
        query = query.filter(Platform.name == platform)
    if sentiment and sentiment != "All":
        query = query.filter(Sentiment.sentiment == sentiment.lower())
    if risk_level and risk_level != "All":
        query = query.filter(Sentiment.risk_level == risk_level.lower())
    if date_from:
        query = query.filter(Content.created_at >= date_from)
    if date_to:
        query = query.filter(Content.created_at <= date_to)

    rows = query.order_by(Content.created_at.desc()).all()

    results = []
    for content, sentiment_row, platform_row in rows:
        results.append(ContentWithSentiment(
            id=content.id,
            text=content.text_content,
            platform=platform_row.name,
            source_url=content.source_url,
            author=content.author,
            date=str(content.created_at.date()) if content.created_at else None,
            sentiment=sentiment_row.sentiment,
            score=sentiment_row.score,
            risk_level=sentiment_row.risk_level,
        ))

    return results


@router.get("/metrics")
def get_metrics(
    brand_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    brand = db.query(Brand).filter(
        Brand.id == brand_id,
        Brand.user_id == current_user.id
    ).first()
    if not brand:
        return {"total": 0, "positive": 0, "neutral": 0, "negative": 0}

    base = (
        db.query(Sentiment)
        .join(Content, Content.id == Sentiment.content_id)
        .filter(Content.brand_id == brand_id)
    )

    total    = base.count()
    positive = base.filter(Sentiment.sentiment == "positive").count()
    neutral  = base.filter(Sentiment.sentiment == "neutral").count()
    negative = base.filter(Sentiment.sentiment == "negative").count()

    return {
        "total_mentions":    total,
        "positive_mentions": positive,
        "neutral_mentions":  neutral,
        "negative_mentions": negative,
    }
