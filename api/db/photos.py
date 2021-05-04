from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.orm import relationship

from db.database import Base


class Photos(Base):
    __tablename__ = "Photos"
    id = Column(String, primary_key=True)
    email = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)
    s3_thumbnail_key = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    height = Column(Integer, nullable=False)
    width = Column(Integer, nullable=False)
    size = Column(Float, nullable=False)
    uploaded_at = Column(DateTime, nullable=False)

    owner = relationship("Users", back_populates="photos")
