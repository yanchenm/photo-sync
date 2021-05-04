from sqlalchemy import Column, String, Integer, Float, DateTime, desc
from sqlalchemy.orm import relationship, Session

from db.database import Base
from models.photos import Photo


class Photos(Base):
    __tablename__ = "Photos"
    id = Column(String, primary_key=True)
    email = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)
    s3_thumbnail_key = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    height = Column(Integer, nullable=False)
    width = Column(Integer, nullable=False)
    size = Column(Float, nullable=False)
    uploaded_at = Column(DateTime, nullable=False)

    owner = relationship("Users", back_populates="photos")


def get_photos(db: Session, email: str, start: int, count: int):
    return db.query(Photos).filter(Photos.email == email).order_by(desc(Photos.uploaded_at))\
        .offset(start).limit(count).all()


def get_num_photos(db: Session, email: str):
    return db.query(Photos).filter(Photos.email == email).count()


def get_photo_by_id(db: Session, photo_id: str):
    return db.query(Photos).filter(Photos.id == photo_id).first()


def add_photo(db: Session, photo: Photo):
    db_photo = Photos(**photo.dict())
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    return db_photo


def delete_photo(db: Session, photo_id: str):
    photo = db.query(Photos).filter(Photos.id == photo_id).first()
    db.delete(photo)
    db.commit()
