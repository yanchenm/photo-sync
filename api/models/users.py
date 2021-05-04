from datetime import datetime
from typing import List

import bcrypt
from pydantic import BaseModel

from models.auth import Auth
from models.photos import Photo


class UserBase(BaseModel):
    email: str
    name: str


class UserLogin(UserBase):
    password: str

    def hash_password(self):
        hashed_password = bcrypt.hashpw(self.password.encode("utf-8"), bcrypt.gensalt())
        self.password = hashed_password.decode("utf-8")


class User(UserBase):
    created_at: datetime
    photos: List[Photo] = []
    auth: List[Auth] = []

    class Config:
        orm_mode = True


class UserWithAuth(User):
    password: str

    def verify_password(self, password: str) -> bool:
        return bcrypt.checkpw(password.encode("utf-8"), self.password.encode("utf-8"))
