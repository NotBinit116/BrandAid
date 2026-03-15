from sqlalchemy import Column, Integer, ForeignKey, DATE, String, TIMESTAMP
from sqlalchemy.sql import func
from app.database.connection import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    brand_id = Column(Integer, ForeignKey("brands.id"))

    report_name = Column(String, nullable=False)

    date_from = Column(DATE, nullable=True)
    date_to = Column(DATE, nullable=True)

    # Filter snapshot
    filter_platform = Column(String, default="All")
    filter_sentiment = Column(String, default="All")
    filter_risk_level = Column(String, default="All")

    file_path = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
