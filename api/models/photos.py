from datetime import datetime

from pydantic import BaseModel


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

    class Config:
        orm_mode = True
