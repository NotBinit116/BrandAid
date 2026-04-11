"""
Account Filtering Service — tracks authors who consistently
post negative content and flags them automatically.

Flagging rules:
- Author has 3+ negative posts for the same brand
- AND negative ratio > 70%
"""
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.author_flag import AuthorFlag
from app.models.content import Content
from app.models.sentiment import Sentiment
from app.models.platform import Platform


NEGATIVE_COUNT_THRESHOLD = 3    # min negative posts to consider
NEGATIVE_RATIO_THRESHOLD = 0.70 # min ratio to flag


def update_author_stats(
    db: Session,
    brand_id: int,
    author: str,
    platform: str,
    sentiment: str,
):
    """Called after each new post is saved. Updates author stats."""
    if not author or author.strip() in ("", "None", "null"):
        return

    # Find or create author record
    record = db.query(AuthorFlag).filter(
        AuthorFlag.brand_id == brand_id,
        AuthorFlag.author   == author,
        AuthorFlag.platform == platform,
    ).first()

    if not record:
        record = AuthorFlag(
            brand_id = brand_id,
            author   = author,
            platform = platform,
        )
        db.add(record)

    record.total_count += 1
    if sentiment == "negative":
        record.negative_count += 1

    if record.total_count > 0:
        record.negative_ratio = record.negative_count / record.total_count

    # Auto-flag check
    if (
        record.negative_count >= NEGATIVE_COUNT_THRESHOLD and
        record.negative_ratio >= NEGATIVE_RATIO_THRESHOLD and
        not record.is_flagged
    ):
        record.is_flagged = True
        record.flagged_at = datetime.utcnow()
        print(f"[AccountFilter] Flagged author: {author} on {platform} "
              f"({record.negative_count}/{record.total_count} negative)")

    db.commit()


def get_flagged_authors(db: Session, brand_id: int) -> list:
    """Returns all flagged authors for a brand."""
    return db.query(AuthorFlag).filter(
        AuthorFlag.brand_id  == brand_id,
        AuthorFlag.is_flagged == True,
    ).order_by(AuthorFlag.negative_count.desc()).all()


def get_all_author_stats(db: Session, brand_id: int) -> list:
    """Returns all author stats for a brand, sorted by negative count."""
    return db.query(AuthorFlag).filter(
        AuthorFlag.brand_id == brand_id,
        AuthorFlag.total_count > 1,
    ).order_by(AuthorFlag.negative_count.desc()).all()


def unflag_author(db: Session, brand_id: int, author_flag_id: int) -> bool:
    """Manually unflag an author."""
    record = db.query(AuthorFlag).filter(
        AuthorFlag.id       == author_flag_id,
        AuthorFlag.brand_id == brand_id,
    ).first()
    if not record:
        return False
    record.is_flagged = False
    record.flagged_at = None
    db.commit()
    return True
