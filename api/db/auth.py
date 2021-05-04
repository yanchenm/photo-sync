from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from db.database import Base


class Auth(Base):
    __tablename__ = "Auth"
    email = Column(String, primary_key=True)
    token = Column(String, unique=True, primary_key=True)

    owner = relationship("Users", back_populates="auth")
