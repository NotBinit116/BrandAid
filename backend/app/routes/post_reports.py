from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.database.connection import get_db
from app.models.user import User
from app.models.post_report import PostReport
from app.models.content import Content
from app.services.security import get_current_user

router = APIRouter()


class PostReportCreate(BaseModel):
    content_id: int
    reason:     str
    notes:      Optional[str] = None


class PostReportResponse(BaseModel):
    id:         int
    content_id: int
    user_id:    int
    reason:     str
    notes:      Optional[str]
    status:     str
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=PostReportResponse, status_code=201)
def create_report(
    data: PostReportCreate,
    db:   Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = db.query(Content).filter(Content.id == data.content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    existing = db.query(PostReport).filter(
        PostReport.content_id == data.content_id,
        PostReport.user_id    == current_user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already reported")

    report = PostReport(
        content_id = data.content_id,
        user_id    = current_user.id,
        reason     = data.reason,
        notes      = data.notes,
        status     = "pending",
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/", response_model=List[PostReportResponse])
def get_my_reports(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    return (
        db.query(PostReport)
        .filter(PostReport.user_id == current_user.id)
        .order_by(PostReport.created_at.desc())
        .all()
    )


@router.get("/all", response_model=List[PostReportResponse])
def get_all_reports(
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return (
        db.query(PostReport)
        .order_by(PostReport.created_at.desc())
        .all()
    )


@router.put("/{report_id}/status")
def update_status(
    report_id: int,
    status:    str,
    db:        Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    if status not in ("pending", "reviewed", "dismissed"):
        raise HTTPException(status_code=400, detail="Invalid status")
    report = db.query(PostReport).filter(PostReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = status
    db.commit()
    return {"success": True}
