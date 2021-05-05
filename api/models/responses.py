from pydantic import BaseModel

from models.users import User


class LoginResponse(BaseModel):
    token: str
    user: User
