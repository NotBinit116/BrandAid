from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, Text
from sqlalchemy.sql import func
from app.database.connection import Base


class PostReport(Base):
    __tablename__ = "post_reports"

    id         = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("content.id"))
    user_id    = Column(Integer, ForeignKey("users.id"))
    reason     = Column(String, nullable=False)
    notes      = Column(Text, nullable=True)
    status     = Column(String, default="pending")
    created_at = Column(TIMESTAMP, server_default=func.now())
