from sqlalchemy import Column, Integer, String, Float, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database.connection import Base


class Sentiment(Base):
    __tablename__ = "sentiment"

    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("content.id"))

    sentiment = Column(String)
    score = Column(Float)
    risk_level = Column(String)

    analyzed_at = Column(TIMESTAMP, server_default=func.now())