from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.models.brand import Brand
from app.services.security import get_current_user

router = APIRouter()


@router.post("/run/{brand_id}")
def run_crawler(
    brand_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Trigger crawlers for a brand. Runs in background."""
    # Verify brand belongs to user
    brand = db.query(Brand).filter(
        Brand.id == brand_id,
        Brand.user_id == current_user.id
    ).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    # Run in background so API returns immediately
    background_tasks.add_task(_run_crawlers_bg, brand_id)

    return {
        "message": f"Crawlers started for brand '{brand.brand_name}'",
        "brand_id": brand_id,
        "status": "running"
    }


@router.post("/run/{brand_id}/sync")
def run_crawler_sync(
    brand_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Trigger crawlers synchronously — waits for completion. Use for testing."""
    brand = db.query(Brand).filter(
        Brand.id == brand_id,
        Brand.user_id == current_user.id
    ).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    from crawler.crawler_service import run_crawlers_for_brand
    result = run_crawlers_for_brand(db, brand_id)
    return result


def _run_crawlers_bg(brand_id: int):
    """Background task — creates its own DB session."""
    from app.database.connection import SessionLocal
    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    from crawler.crawler_service import run_crawlers_for_brand

    db = SessionLocal()
    try:
        run_crawlers_for_brand(db, brand_id)
    finally:
        db.close()