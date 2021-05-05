from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey, func
from sqlalchemy.orm import relationship

from database.database import Base


class Users(Base):
    __tablename__ = "Users"
    email = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())


class Photos(Base):
    __tablename__ = "Photos"
    id = Column(String, primary_key=True)
    email = Column(String, ForeignKey("Users.email"), nullable=False)
    file_name = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)
    s3_thumbnail_key = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    height = Column(Integer, nullable=False)
    width = Column(Integer, nullable=False)
    size = Column(Float, nullable=False)
    uploaded_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())


class Tokens(Base):
    __tablename__ = "Tokens"
    email = Column(String, ForeignKey("Users.email"), primary_key=True)
    token = Column(String, unique=True, primary_key=True)
