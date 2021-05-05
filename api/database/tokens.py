from sqlalchemy import and_
from sqlalchemy.exc import NoResultFound, MultipleResultsFound
from sqlalchemy.orm import Session

from database.schemas import Tokens
from models.auth import Token


def is_token_valid(db: Session, email: str, token: str) -> bool:
    try:
        db.query(Tokens).filter(and_(Tokens.email == email, Tokens.token == token)).one()
        return True
    except (MultipleResultsFound, NoResultFound):
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
