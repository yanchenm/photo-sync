import os

from fastapi import APIRouter, Response, status, HTTPException

from models.users import UserCreateResponse, UserCreate

router = APIRouter()


@router.post("/user", status_code=status.HTTP_201_CREATED, response_model=UserCreateResponse, tags=["user"])
def create_user(user: UserCreate):
    if os.getenv("DISABLE_SIGNUP") != "false":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="you can't do that right now")

    try:
        user.hash_password()


