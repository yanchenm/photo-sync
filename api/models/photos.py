from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PhotoBase(BaseModel):
    id: str
    email: str
    file_name: str
    s3_key: str
    s3_thumbnail_key: str
    file_type: str
    height: int
    width: int
    size: float


class Photo(PhotoBase):
    uploaded_at: datetime
    url: Optional[str]
    thumbnail_url: Optional[str]

    class Config:
        orm_mode = True
