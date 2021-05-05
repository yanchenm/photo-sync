import os
from datetime import timedelta, datetime
from typing import Optional

import jwt
from fastapi import APIRouter, status, Depends, HTTPException, Response, Cookie
from jwt import PyJWTError
from sqlalchemy.orm import Session

import database.tokens
import database.users
from dependencies.auth import generate_token, authenticate_route
from dependencies.database import get_db
from models.auth import Token
from models.responses import LoginResponse
from models.users import UserLogin, UserWithAuth, User

router = APIRouter(
    tags=["auth"],
)

ACCESS_TOKEN_KEY = os.environ["ACCESS_TOKEN_KEY"]
REFRESH_TOKEN_KEY = os.environ["REFRESH_TOKEN_KEY"]
ALGORITHM = "HS256"


@router.post("/login", status_code=status.HTTP_200_OK, response_model=LoginResponse)
def login(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    db_user = database.users.get_user_by_email(db, user.email)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid credentials")

    user_with_auth = UserWithAuth.from_orm(db_user)
    if not user_with_auth.verify_password(user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid credentials")

    access_token_expiration = datetime.utcnow() + timedelta(minutes=15)
    access_token = generate_token(user.email, ACCESS_TOKEN_KEY, access_token_expiration)

    refresh_token_expiration = datetime.utcnow() + timedelta(days=14)
    refresh_token = generate_token(user.email, REFRESH_TOKEN_KEY, refresh_token_expiration)

    database.tokens.add_token(db, Token(email=user.email, token=refresh_token))
    response.set_cookie(key="refresh", value=refresh_token, expires=int(refresh_token_expiration.timestamp()))

    user_response = User.from_orm(db_user)
    return LoginResponse(token=access_token, user=user_response)


@router.post("/refresh", status_code=status.HTTP_200_OK, response_model=LoginResponse)
def refresh_auth(response: Response, refresh: Optional[str] = Cookie(None), db: Session = Depends(get_db)):
    if refresh is None or not refresh:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="no refresh cookie received")

    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid credentials")

    try:
        jwt_options = {"require": ["email", "exp"]}
        payload = jwt.decode(refresh, REFRESH_TOKEN_KEY, algorithms=[ALGORITHM], options=jwt_options)
        email: str = payload.get("email")
    except PyJWTError:
        raise credentials_exception

    if not database.tokens.is_token_valid(db, email, refresh):
        raise credentials_exception

    # Revoke old token
    database.tokens.delete_token(db, email, refresh)

    # Generate new tokens
    access_token_expiration = datetime.utcnow() + timedelta(minutes=15)
    access_token = generate_token(email, ACCESS_TOKEN_KEY, access_token_expiration)

    refresh_token_expiration = datetime.utcnow() + timedelta(days=14)
    refresh_token = generate_token(email, REFRESH_TOKEN_KEY, refresh_token_expiration)

    database.tokens.add_token(db, Token(email=email, token=refresh_token))
    response.set_cookie(key="refresh", value=refresh_token, expires=int(refresh_token_expiration.timestamp()))

    db_user = database.users.get_user_by_email(db, email)
    user = User.from_orm(db_user)
    return LoginResponse(token=access_token, user=user)


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(response: Response, refresh: Optional[str] = Cookie(None), user: User = Depends(authenticate_route),
           db: Session = Depends(get_db)):
    if refresh is None or not refresh:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="no refresh cookie received")

    # Revoke refresh token
    database.tokens.delete_token(db, user.email, refresh)

    # Remove token from cookie
    response.set_cookie(key="refresh", value="")
