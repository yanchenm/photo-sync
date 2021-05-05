from sqlalchemy.orm import Session

from database.schemas import Users
from models.users import UserCreate


def get_user_by_email(db: Session, email: str):
    return db.query(Users).filter(Users.email == email).first()


def create_user(db: Session, user: UserCreate):
    db_user = Users(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, email: str):
    user = db.query(Users).filter(Users.email == email).first()
    db.delete(user)
    db.commit()
