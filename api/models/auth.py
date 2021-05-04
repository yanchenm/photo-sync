from pydantic import BaseModel

from models.users import User


class Token(BaseModel):
    email: str
    token: str
    owner: User

    class Config:
        orm_mode = True
