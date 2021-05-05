from datetime import datetime

from passlib.hash import bcrypt
from pydantic import BaseModel


class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    name: str
    password: str

    def hash_password(self):
        self.password = bcrypt.hash(self.password)


class UserLogin(UserBase):
    password: str


class User(UserBase):
    name: str
    created_at: datetime

    class Config:
        orm_mode = True


class UserWithAuth(User):
    password: str

    def verify_password(self, password: str) -> bool:
        return bcrypt.verify(password, self.password)
