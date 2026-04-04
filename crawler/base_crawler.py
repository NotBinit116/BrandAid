"""
Base crawler — all crawlers inherit from this.
Handles common logic: deduplication, filtering, DB saving, sentiment analysis.
"""
import sys
import os
from datetime import datetime
from sqlalchemy.orm import Session

# Add ml/ to path for sentiment
ML_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "ml")
sys.path.insert(0, os.path.abspath(ML_PATH))
from sentiment_service import analyse
from crawler.content_filter import filter_batch


class BaseCrawler:
    def __init__(self, db: Session, platform_id: int, brand_id: int, keywords: list, brand_name: str = ""):
        self.db = db
        self.platform_id = platform_id
        self.brand_id = brand_id
        self.keywords = keywords
        self.brand_name = brand_name or (keywords[0] if keywords else "")

    def fetch(self) -> list:
        """Override in subclass. Return list of dicts with keys:
        text, source_url, author, created_at
        """
        raise NotImplementedError

    def save_content(self, item: dict):
        """Save content + sentiment to DB, skip duplicates."""
        from app.models.content import Content
        from app.models.sentiment import Sentiment

        # Dedup by source_url
        existing = self.db.query(Content).filter(
            Content.source_url == item.get("source_url"),
            Content.brand_id == self.brand_id
        ).first()

        if existing:
            return None

        # Save content
        content = Content(
            brand_id=self.brand_id,
            platform_id=self.platform_id,
            text_content=item.get("text", ""),
            source_url=item.get("source_url", ""),
            author=item.get("author", ""),
            created_at=item.get("created_at", datetime.utcnow()),
            collected_at=datetime.utcnow(),
        )
        self.db.add(content)
        self.db.flush()

        # Analyse sentiment
        result = analyse(item.get("text", ""))

        sentiment = Sentiment(
            content_id=content.id,
            sentiment=result["sentiment"],
            score=result["score"],
            risk_level=result["risk_level"],
            analyzed_at=datetime.utcnow(),
        )
        self.db.add(sentiment)
        self.db.commit()

        return content

    def run(self) -> dict:
        """Fetch, filter, and save all results. Returns summary."""
        items = self.fetch()

        # Apply language + relevance filter
        items = filter_batch(items, self.brand_name, keywords=self.keywords)

        saved = 0
        skipped = 0

        for item in items:
            result = self.save_content(item)
            if result:
                saved += 1
            else:
                skipped += 1

        return {
            "platform_id": self.platform_id,
            "fetched": len(items),
            "saved": saved,
            "skipped": skipped,
        }
