from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship

from db.database import Base


class Users(Base):
    __tablename__ = "Users"
    email = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

    photos = relationship("Photos", back_populates="owner")
    auth = relationship("Auth", back_populates="owner")
