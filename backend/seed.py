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
    {"name": "Twitter",   "type": "social",  "enabled": True},
    {"name": "Reddit",    "type": "forum",   "enabled": True},
    {"name": "Instagram", "type": "social",  "enabled": True},
    {"name": "Facebook",  "type": "social",  "enabled": True},
    {"name": "LinkedIn",  "type": "social",  "enabled": True},
    {"name": "YouTube",   "type": "video",   "enabled": True},
    {"name": "TikTok",    "type": "video",   "enabled": True},
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
