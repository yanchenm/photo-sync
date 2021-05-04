from datetime import datetime

from pydantic import BaseModel

from models.users import User


class Photo(BaseModel):
    id: str
    email: str
    file_name: str
    s3_key: str
    s3_thumbnail_key: str
    file_type: str
    height: int
    width: int
    size: float
    uploaded_at: datetime
    owner = User

    class Config:
        orm_mode = True
