from sqlalchemy import Column, Integer, ForeignKey, DATE, String, TIMESTAMP
from sqlalchemy.sql import func
from app.database.connection import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    brand_id = Column(Integer, ForeignKey("brands.id"))

    date_from = Column(DATE)
    date_to = Column(DATE)

    file_path = Column(String)

    created_at = Column(TIMESTAMP, server_default=func.now())