from sqlalchemy import desc
from sqlalchemy.orm import Session

from database.schemas import Photos
from models.photos import Photo


def get_photos(db: Session, email: str, start: int, count: int):
    return db.query(Photos).filter(Photos.email == email).order_by(desc(Photos.uploaded_at)) \
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
