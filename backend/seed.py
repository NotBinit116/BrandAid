"""
Run once to seed the platforms table:
    python seed.py
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.database.connection import SessionLocal, engine, Base
import app.models  # noqa: register all models

Base.metadata.create_all(bind=engine)

from app.models.platform import Platform

PLATFORMS = [
    {"name": "YouTube",     "type": "video",  "enabled": True},
    {"name": "Google News", "type": "news",   "enabled": True},
    {"name": "HackerNews",  "type": "forum",  "enabled": True},
    {"name": "Trustpilot",  "type": "review", "enabled": True},
]

db = SessionLocal()

try:
    existing = db.query(Platform).count()
    if existing > 0:
        print(f"Platforms already seeded ({existing} rows). Skipping.")
    else:
        for p in PLATFORMS:
            db.add(Platform(**p))
        db.commit()
        print(f"✅ Seeded {len(PLATFORMS)} platforms.")
finally:
    db.close()
