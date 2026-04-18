from sqlalchemy.orm import Session
from datetime import datetime
from app.models.author_flag import AuthorFlag

NEGATIVE_COUNT_THRESHOLD = 3
NEGATIVE_RATIO_THRESHOLD = 0.70


def update_author_stats(db: Session, brand_id: int, author: str, platform: str, sentiment: str):
    if not author or author.strip() in ("", "None", "null"):
        return

    record = db.query(AuthorFlag).filter(
        AuthorFlag.brand_id == brand_id,
        AuthorFlag.author   == author,
        AuthorFlag.platform == platform,
    ).first()

    if not record:
        record = AuthorFlag(brand_id=brand_id, author=author, platform=platform)
        db.add(record)

    record.total_count += 1
    if sentiment == "negative":
        record.negative_count += 1

    if record.total_count > 0:
        record.negative_ratio = record.negative_count / record.total_count

    if (
        record.negative_count >= NEGATIVE_COUNT_THRESHOLD and
        record.negative_ratio >= NEGATIVE_RATIO_THRESHOLD and
        not record.is_flagged
    ):
        record.is_flagged = True
        record.flagged_at = datetime.utcnow()
        print(f"[AccountFilter] Flagged: {author} on {platform} ({record.negative_count}/{record.total_count})")

    db.commit()


def get_flagged_authors(db: Session, brand_id: int) -> list:
    return db.query(AuthorFlag).filter(
        AuthorFlag.brand_id   == brand_id,
        AuthorFlag.is_flagged == True,
    ).order_by(AuthorFlag.negative_count.desc()).all()


def get_all_author_stats(db: Session, brand_id: int) -> list:
    return db.query(AuthorFlag).filter(
        AuthorFlag.brand_id    == brand_id,
        AuthorFlag.total_count > 1,
    ).order_by(AuthorFlag.negative_count.desc()).all()


def unflag_author(db: Session, brand_id: int, author_flag_id: int) -> bool:
    record = db.query(AuthorFlag).filter(
        AuthorFlag.id == author_flag_id, AuthorFlag.brand_id == brand_id
    ).first()
    if not record:
        return False
    record.is_flagged = False
    record.flagged_at = None
    db.commit()
    return True
