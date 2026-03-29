import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database.connection import get_db
from app.models.user import User
from app.models.brand import Brand
from app.models.report import Report
from app.models.content import Content
from app.models.sentiment import Sentiment
from app.models.platform import Platform
from app.schemas.report_schema import ReportCreate, ReportResponse
from app.services.security import get_current_user
from app.services.ai_summarizer import summarize_brand_report
from app.services.pdf_generator import generate_pdf_report

router = APIRouter()

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")


def get_content_for_report(db: Session, brand_id: int, filters: dict) -> dict:
    """Fetch content + sentiment for a brand with optional filters."""
    query = (
        db.query(Content, Sentiment, Platform)
        .join(Sentiment, Sentiment.content_id == Content.id)
        .join(Platform, Platform.id == Content.platform_id)
        .filter(Content.brand_id == brand_id)
    )

    if filters.get("filter_platform") and filters["filter_platform"] != "All":
        query = query.filter(Platform.name == filters["filter_platform"])
    if filters.get("filter_sentiment") and filters["filter_sentiment"] != "All":
        query = query.filter(Sentiment.sentiment == filters["filter_sentiment"].lower())
    if filters.get("filter_risk_level") and filters["filter_risk_level"] != "All":
        query = query.filter(Sentiment.risk_level == filters["filter_risk_level"].lower())
    if filters.get("date_from"):
        query = query.filter(Content.created_at >= filters["date_from"])
    if filters.get("date_to"):
        query = query.filter(Content.created_at <= filters["date_to"])

    rows = query.all()

    all_posts = []
    for content, sentiment_row, platform_row in rows:
        all_posts.append({
            "id": content.id,
            "text": content.text_content or "",
            "platform": platform_row.name,
            "source_url": content.source_url,
            "author": content.author,
            "date": str(content.created_at.date()) if content.created_at else "",
            "sentiment": sentiment_row.sentiment,
            "score": sentiment_row.score,
            "risk_level": sentiment_row.risk_level,
        })

    positive = [p for p in all_posts if p["sentiment"] == "positive"]
    negative = [p for p in all_posts if p["sentiment"] == "negative"]
    neutral  = [p for p in all_posts if p["sentiment"] == "neutral"]

    # Sort negative by score descending (highest confidence negative first)
    negative.sort(key=lambda x: x.get("score", 0), reverse=True)

    metrics = {
        "total_mentions":    len(all_posts),
        "positive_mentions": len(positive),
        "neutral_mentions":  len(neutral),
        "negative_mentions": len(negative),
    }

    return {
        "metrics": metrics,
        "positive": positive,
        "negative": negative,
        "neutral":  neutral,
    }


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

    # Fetch content data
    filters = {
        "filter_platform":   data.filter_platform,
        "filter_sentiment":  data.filter_sentiment,
        "filter_risk_level": data.filter_risk_level,
        "date_from":         str(data.date_from) if data.date_from else None,
        "date_to":           str(data.date_to)   if data.date_to   else None,
    }

    content_data = get_content_for_report(db, data.brand_id, filters)
    metrics      = content_data["metrics"]
    positive     = content_data["positive"]
    negative     = content_data["negative"]
    neutral      = content_data["neutral"]

    # Generate AI summary
    print(f"[Reports] Generating AI summary for {brand.brand_name}...")
    ai_summary = summarize_brand_report(
        brand_name=brand.brand_name,
        metrics=metrics,
        top_positive=positive[:5],
        top_negative=negative[:5],
        top_neutral=neutral[:5],
        filters=filters,
    )

    # Generate PDF
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename  = f"report_{brand.brand_name.lower().replace(' ', '_')}_{timestamp}.pdf"
    os.makedirs(REPORTS_DIR, exist_ok=True)
    pdf_path  = os.path.join(REPORTS_DIR, filename)

    print(f"[Reports] Generating PDF at {pdf_path}...")
    generate_pdf_report(
        brand_name=brand.brand_name,
        metrics=metrics,
        ai_summary=ai_summary,
        top_positive=positive[:5],
        top_negative=negative[:5],
        filters=filters,
        output_path=pdf_path,
    )

    # Save report to DB
    report = Report(
        user_id=current_user.id,
        brand_id=data.brand_id,
        report_name=data.report_name,
        date_from=data.date_from,
        date_to=data.date_to,
        filter_platform=data.filter_platform,
        filter_sentiment=data.filter_sentiment,
        filter_risk_level=data.filter_risk_level,
        file_path=pdf_path,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    print(f"[Reports] Report saved — ID: {report.id}")
    return report


@router.get("/{report_id}/download")
def download_report(
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
    if not report.file_path or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="PDF file not found")

    return FileResponse(
        path=report.file_path,
        media_type="application/pdf",
        filename=os.path.basename(report.file_path),
    )


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

    # Delete PDF file if exists
    if report.file_path and os.path.exists(report.file_path):
        os.remove(report.file_path)

    db.delete(report)
    db.commit()
