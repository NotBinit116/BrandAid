from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.user import User
from app.models.brand import Brand
from app.models.report import Report
from app.schemas.report_schema import ReportCreate, ReportResponse
from app.services.security import get_current_user

router = APIRouter()


@router.get("/", response_model=List[ReportResponse])
def get_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Report)
        .filter(Report.user_id == current_user.id)
        .order_by(Report.created_at.desc())
        .all()
    )


@router.post("/", response_model=ReportResponse, status_code=201)
def create_report(
    data: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify brand belongs to user
    brand = db.query(Brand).filter(
        Brand.id == data.brand_id,
        Brand.user_id == current_user.id
    ).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    report = Report(
        user_id=current_user.id,
        brand_id=data.brand_id,
        report_name=data.report_name,
        date_from=data.date_from,
        date_to=data.date_to,
        filter_platform=data.filter_platform,
        filter_sentiment=data.filter_sentiment,
        filter_risk_level=data.filter_risk_level,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.delete("/{report_id}", status_code=204)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()
