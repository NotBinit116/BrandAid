from sqlalchemy import Column, Integer, String, ForeignKey
from app.database.connection import Base


class BrandHandle(Base):
    __tablename__ = "brand_handles"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"))
    platform_id = Column(Integer, ForeignKey("platforms.id"))
    handle = Column(String)