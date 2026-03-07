from sqlalchemy import Column, Integer, String, ForeignKey
from app.database.connection import Base


class BrandKeyword(Base):
    __tablename__ = "brand_keywords"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"))
    keyword = Column(String, nullable=False)
    keyword_type = Column(String)