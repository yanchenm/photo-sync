import os
from datetime import datetime
from typing import List, Optional

import jwt
from fastapi import Header, HTTPException, status, Depends
from jwt import PyJWTError
from sqlalchemy.orm import Session

import database.users
from dependencies.database import get_db
from models.users import User

ACCESS_TOKEN_KEY = os.environ["ACCESS_TOKEN_KEY"]
ALGORITHM = "HS256"


def authenticate_route(authorization: Optional[List[str]] = Header(None), db: Session = Depends(get_db)):
    if not authorization or authorization[0] is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="no authorization header received")

    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid credentials")

    token = authorization[0]
    if token.startswith("Bearer "):
        token = token[len("Bearer "):]

    if not token:
        raise credentials_exception

    try:
        jwt_options = {"require": ["email", "exp"]}
        payload = jwt.decode(token, ACCESS_TOKEN_KEY, algorithms=[ALGORITHM], options=jwt_options)
        email: str = payload.get("email")
    except PyJWTError:
        raise credentials_exception

    if email is None:
        raise credentials_exception

    user = database.users.get_user_by_email(db, email)
    if user is None:
        raise credentials_exception

    return User.from_orm(user)


def generate_token(email: str, secret_key: str, expiry: datetime) -> str:
    payload = {
        "email": email,
        "exp": expiry,
    }

    return jwt.encode(payload, secret_key, algorithm=ALGORITHM)
