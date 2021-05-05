from typing import List

from pydantic import BaseModel

from models.photos import Photo
from models.users import User


class LoginResponse(BaseModel):
    token: str
    user: User


class GetPhotosResponse(BaseModel):
    items: List[Photo]
    has_more: bool
    total: int
