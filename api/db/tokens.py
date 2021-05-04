from sqlalchemy import Column, String, and_
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import relationship, Session

from db.database import Base
from models.auth import Token


class Tokens(Base):
    __tablename__ = "Tokens"
    email = Column(String, primary_key=True)
    token = Column(String, unique=True, primary_key=True)

    owner = relationship("Users", back_populates="tokens")


def is_token_valid(db: Session, email: str, token: str) -> bool:
    try:
        db.query(Tokens).filter(and_(Tokens.email == email, Tokens.token == token)).one()
        return True
    except NoResultFound:
        return False


def add_token(db: Session, token: Token):
    db_token = Tokens(**token.dict())
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token


def delete_token(db: Session, email: str, token: str):
    token = db.query(Tokens).filter(and_(Tokens.email == email, Tokens.token == token)).first()
    db.delete(token)
    db.commit()
