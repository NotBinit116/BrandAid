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
    id:            int
    email:         str
    role:          str
    created_at:    datetime
    brand_count:   Optional[int] = 0
    content_count: Optional[int] = 0

    class Config:
        from_attributes = True


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/users", response_model=List[UserAdminResponse])
def get_all_users(
    db:    Session = Depends(get_db),
    admin: User    = Depends(require_admin)
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
    db:    Session = Depends(get_db),
    admin: User    = Depends(require_admin)
):
    total_users   = db.query(User).count()
    total_brands  = db.query(Brand).count()
    total_content = db.query(Content).count()
    total_pos     = db.query(Sentiment).filter(Sentiment.sentiment == "positive").count()
    total_neu     = db.query(Sentiment).filter(Sentiment.sentiment == "neutral").count()
    total_neg     = db.query(Sentiment).filter(Sentiment.sentiment == "negative").count()

    intent_counts = db.query(
        Sentiment.intent, func.count(Sentiment.id)
    ).group_by(Sentiment.intent).all()

    return {
        "total_users":   total_users,
        "total_brands":  total_brands,
        "total_content": total_content,
        "sentiment": {
            "positive": total_pos,
            "neutral":  total_neu,
            "negative": total_neg,
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

    # ── Cascade delete all user data ──────────────────────────
    from app.models.keyword import BrandKeyword
    from app.models.handle import BrandHandle
    from app.models.report import Report
    from app.models.author_flag import AuthorFlag
    from app.models.post_report import PostReport

    # Get all brands for this user
    brands = db.query(Brand).filter(Brand.user_id == user_id).all()
    brand_ids = [b.id for b in brands]

    if brand_ids:
        # Get all content for these brands
        contents = db.query(Content).filter(Content.brand_id.in_(brand_ids)).all()
        content_ids = [c.id for c in contents]

        if content_ids:
            # Delete sentiment records
            db.query(Sentiment).filter(Sentiment.content_id.in_(content_ids)).delete(synchronize_session=False)
            # Delete post reports
            db.query(PostReport).filter(PostReport.content_id.in_(content_ids)).delete(synchronize_session=False)
            # Delete content
            db.query(Content).filter(Content.brand_id.in_(brand_ids)).delete(synchronize_session=False)

        # Delete brand config
        db.query(BrandKeyword).filter(BrandKeyword.brand_id.in_(brand_ids)).delete(synchronize_session=False)
        db.query(BrandHandle).filter(BrandHandle.brand_id.in_(brand_ids)).delete(synchronize_session=False)
        db.query(AuthorFlag).filter(AuthorFlag.brand_id.in_(brand_ids)).delete(synchronize_session=False)
        db.query(Report).filter(Report.brand_id.in_(brand_ids)).delete(synchronize_session=False)

        # Delete brands
        db.query(Brand).filter(Brand.user_id == user_id).delete(synchronize_session=False)

    # Delete user's own post reports
    db.query(PostReport).filter(PostReport.user_id == user_id).delete(synchronize_session=False)

    # Delete reports created by user
    db.query(Report).filter(Report.user_id == user_id).delete(synchronize_session=False)

    # Finally delete user
    db.delete(user)
    db.commit()

    return {"success": True, "deleted_user_id": user_id, "deleted_brands": len(brand_ids)}
