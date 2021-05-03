from datetime import datetime

import bcrypt
from pydantic import BaseModel
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func

from db.database import Base


class Users(Base):
    __tablename__ = "User"
    email = Column(Text, primary_key=True)
    name = Column(Text)
    password = Column(String(60))
    created_at = Column(DateTime, default=func.now())


class UserCreate(BaseModel):
    email: str
    name: str
    password: str

    def hash_password(self):
        hashed_password = bcrypt.hashpw(self.password.encode("utf-8"), bcrypt.gensalt())
        self.password = hashed_password.decode("utf-8")

    def verify_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode("utf-8"), self.password.encode("utf-8"))


class UserCreateResponse(BaseModel):
    email: str
    name: str
    created_at: datetime


class UserLogin(BaseModel):
    email: str
    password: str
