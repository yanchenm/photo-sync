from pydantic import BaseModel


class Token(BaseModel):
    email: str
    token: str

    class Config:
        orm_mode = True
