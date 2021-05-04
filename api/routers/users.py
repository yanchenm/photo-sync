import os

from fastapi import APIRouter, status, HTTPException, Depends
from sqlalchemy.orm import Session

import database.users
from dependencies.database import get_db
from models.users import User, UserLogin

router = APIRouter(
    prefix="/user",
    tags=["user"],
)


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=User)
def create_user(user: UserLogin, db: Session = Depends(get_db)):
    if os.getenv("DISABLE_SIGNUP") != "false":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="you can't do that right now")

    existing_user = database.users.get_user_by_email(db, user.email)
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="user with that email already exists")

    user.hash_password()
    db_user = database.users.create_user(db, user)
    response = User.from_orm(db_user)
    return response


@router.get("/{email}", status_code=status.HTTP_200_OK, response_model=User)
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    db_user = database.users.get_user_by_email(db, email)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")

    user = User.from_orm(db_user)
    return user
