"""
Admin routes — user management, system stats.
Only accessible by users with role='admin'.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.database.connection import get_db
from app.models.user import User
from app.models.brand import Brand
from app.models.content import Content
from app.models.sentiment import Sentiment
from app.services.security import get_current_user

router = APIRouter()


class UserAdminResponse(BaseModel):
    id:         int
    email:      str
    role:       str
    created_at: datetime
    brand_count: Optional[int] = 0
    content_count: Optional[int] = 0

    class Config:
        from_attributes = True


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/users", response_model=List[UserAdminResponse])
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for user in users:
        brand_count   = db.query(Brand).filter(Brand.user_id == user.id).count()
        brand_ids     = [b.id for b in db.query(Brand).filter(Brand.user_id == user.id).all()]
        content_count = db.query(Content).filter(Content.brand_id.in_(brand_ids)).count() if brand_ids else 0
        result.append(UserAdminResponse(
            id            = user.id,
            email         = user.email,
            role          = user.role,
            created_at    = user.created_at,
            brand_count   = brand_count,
            content_count = content_count,
        ))
    return result


@router.get("/stats")
def get_system_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    total_users    = db.query(User).count()
    total_brands   = db.query(Brand).count()
    total_content  = db.query(Content).count()
    total_positive = db.query(Sentiment).filter(Sentiment.sentiment == "positive").count()
    total_neutral  = db.query(Sentiment).filter(Sentiment.sentiment == "neutral").count()
    total_negative = db.query(Sentiment).filter(Sentiment.sentiment == "negative").count()

    # Intent breakdown
    intent_counts = db.query(
        Sentiment.intent,
        func.count(Sentiment.id)
    ).group_by(Sentiment.intent).all()

    return {
        "total_users":    total_users,
        "total_brands":   total_brands,
        "total_content":  total_content,
        "sentiment": {
            "positive": total_positive,
            "neutral":  total_neutral,
            "negative": total_negative,
        },
        "intents": {row[0]: row[1] for row in intent_counts if row[0]},
    }


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role:    str,
    db:      Session = Depends(get_db),
    admin:   User    = Depends(require_admin)
):
    if role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    user.role = role
    db.commit()
    return {"success": True, "user_id": user_id, "role": role}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db:      Session = Depends(get_db),
    admin:   User    = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    db.delete(user)
    db.commit()
    return {"success": True}
