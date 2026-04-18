from sqlalchemy import Column, Integer, String, Float, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.database.connection import Base


class AuthorFlag(Base):
    __tablename__ = "author_flags"

    id             = Column(Integer, primary_key=True, index=True)
    brand_id       = Column(Integer, ForeignKey("brands.id"))
    author         = Column(String, nullable=False)
    platform       = Column(String, nullable=False)
    negative_count = Column(Integer, default=0)
    total_count    = Column(Integer, default=0)
    negative_ratio = Column(Float, default=0.0)
    is_flagged     = Column(Boolean, default=False)
    flagged_at     = Column(TIMESTAMP, nullable=True)
    created_at     = Column(TIMESTAMP, server_default=func.now())
    updated_at     = Column(TIMESTAMP, server_default=func.now())
