from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database.connection import Base


class Content(Base):
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"))
    platform_id = Column(Integer, ForeignKey("platforms.id"))

    text_content = Column(Text)
    source_url = Column(String)
    author = Column(String)

    created_at = Column(TIMESTAMP)
    collected_at = Column(TIMESTAMP, server_default=func.now())