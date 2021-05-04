from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship, Session

from db.database import Base
from models.users import UserLogin


class Users(Base):
    __tablename__ = "Users"
    email = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

    photos = relationship("Photos", back_populates="owner")
    auth = relationship("Auth", back_populates="owner")


def get_user_by_email(db: Session, email: str):
    return db.query(Users).filter(Users.email == email).first()


def create_user(db: Session, user: UserLogin):
    db_user = Users(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, email: str):
    user = db.query(Users).filter(Users.email == email).first()
    db.delete(user)
    db.commit()
