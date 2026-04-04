"""
Public search route — no authentication required.
Allows guest users to search for brand mentions.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.database.connection import get_db
from app.models.brand import Brand
from app.models.content import Content
from app.models.sentiment import Sentiment
from app.models.platform import Platform

router = APIRouter()


@router.get("/search")
def public_search(
    q: str,
    db: Session = Depends(get_db)
):
    """
    Public brand search — returns limited sentiment preview.
    Max 5 posts per sentiment column for guest users.
    """
    if not q or len(q.strip()) < 2:
        return {"found": False, "query": q, "posts": [], "metrics": None}

    query = q.strip().lower()

    # Find matching brands (case insensitive)
    brands = db.query(Brand).filter(
        func.lower(Brand.brand_name).contains(query)
    ).limit(5).all()

    if not brands:
        return {
            "found": False,
            "query": q,
            "posts": [],
            "metrics": None,
            "message": f"No data found for '{q}'. Try searching for a brand that has been monitored."
        }

    # Use first matching brand
    brand = brands[0]

    # Get posts with sentiment — limit 5 per sentiment for guests
    all_posts = []
    for sentiment_type in ["positive", "neutral", "negative"]:
        rows = (
            db.query(Content, Sentiment, Platform)
            .join(Sentiment, Sentiment.content_id == Content.id)
            .join(Platform, Platform.id == Content.platform_id)
            .filter(
                Content.brand_id == brand.id,
                Sentiment.sentiment == sentiment_type
            )
            .order_by(Content.created_at.desc())
            .limit(5)
            .all()
        )
        for content, sentiment_row, platform_row in rows:
            all_posts.append({
                "id": str(content.id),
                "text": content.text_content or "",
                "platform": platform_row.name,
                "date": str(content.created_at.date()) if content.created_at else "",
                "sentiment": sentiment_row.sentiment,
                "riskLevel": sentiment_row.risk_level,
                "source": content.source_url,
                "author": content.author,
            })

    # Metrics
    base = (
        db.query(Sentiment)
        .join(Content, Content.id == Sentiment.content_id)
        .filter(Content.brand_id == brand.id)
    )
    total    = base.count()
    positive = base.filter(Sentiment.sentiment == "positive").count()
    neutral  = base.filter(Sentiment.sentiment == "neutral").count()
    negative = base.filter(Sentiment.sentiment == "negative").count()

    return {
        "found": True,
        "query": q,
        "brand_name": brand.brand_name,
        "posts": all_posts,
        "metrics": {
            "total_mentions":    total,
            "positive_mentions": positive,
            "neutral_mentions":  neutral,
            "negative_mentions": negative,
        },
        "is_preview": True,
        "message": f"Showing preview for '{brand.brand_name}'. Login to see all {total} mentions."
    }
