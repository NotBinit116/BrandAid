"""
Base crawler — all crawlers inherit from this.
Handles: deduplication, language/relevance filtering,
sentiment analysis, intent classification, DB saving.
"""
import sys
import os
from datetime import datetime
from sqlalchemy.orm import Session

# Add ml/ to path
ML_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "ml")
sys.path.insert(0, os.path.abspath(ML_PATH))

from sentiment_service import analyse
from crawler.content_filter import filter_batch


class BaseCrawler:
    def __init__(self, db: Session, platform_id: int, brand_id: int, keywords: list, brand_name: str = ""):
        self.db          = db
        self.platform_id = platform_id
        self.brand_id    = brand_id
        self.keywords    = keywords
        self.brand_name  = brand_name or (keywords[0] if keywords else "")

    def fetch(self) -> list:
        raise NotImplementedError

    def save_content(self, item: dict):
        from app.models.content import Content
        from app.models.sentiment import Sentiment

        # Dedup by source_url
        existing = self.db.query(Content).filter(
            Content.source_url == item.get("source_url"),
            Content.brand_id   == self.brand_id
        ).first()
        if existing:
            return None

        # Save content
        content = Content(
            brand_id    = self.brand_id,
            platform_id = self.platform_id,
            text_content= item.get("text", ""),
            source_url  = item.get("source_url", ""),
            author      = item.get("author", ""),
            created_at  = item.get("created_at", datetime.utcnow()),
            collected_at= datetime.utcnow(),
        )
        self.db.add(content)
        self.db.flush()

        text = item.get("text", "")

        # Sentiment analysis
        sentiment_result = analyse(text)

        # Intent classification
        intent_result = {"intent": "General Mention", "confidence": 0.5}
        try:
            from intent_classifier import classify_intent
            intent_result = classify_intent(text)
        except Exception as e:
            print(f"[BaseCrawler] Intent classification error: {e}")

        sentiment = Sentiment(
            content_id        = content.id,
            sentiment         = sentiment_result["sentiment"],
            score             = sentiment_result["score"],
            risk_level        = sentiment_result["risk_level"],
            intent            = intent_result.get("intent", "General Mention"),
            intent_confidence = intent_result.get("confidence", 0.5),
            analyzed_at       = datetime.utcnow(),
        )
        self.db.add(sentiment)
        self.db.commit()
        return content

    def run(self) -> dict:
        items = self.fetch()
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
            "fetched":     len(items),
            "saved":       saved,
            "skipped":     skipped,
        }
