from sqlalchemy import Column, Integer, String, Boolean
from app.database.connection import Base


class Platform(Base):
    __tablename__ = "platforms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String)
    enabled = Column(Boolean, default=True)