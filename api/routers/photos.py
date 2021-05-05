import io
import os
import uuid
from typing import List

import boto3
from PIL import Image, UnidentifiedImageError
from botocore.exceptions import ClientError
from fastapi import APIRouter, status, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

import database.photos
from dependencies.auth import authenticate_route
from dependencies.database import get_db
from models.photos import Photo, PhotoBase
from models.responses import GetPhotosResponse
from models.users import User

router = APIRouter(
    prefix="/photos",
    tags=["photos"],
)

THUMBNAIL_MAX_RES = (1200, 1200)
AWS_REGION_NAME = os.getenv("AWS_REGION")
S3_BUCKET = os.getenv("S3_BUCKET")
SIGNED_URL_DURATION = 15 * 60
FILE_NAME_PARAM = "attachment; filename=\"{file_name}\""


@router.post("", status_code=status.HTTP_201_CREATED, response_model=Photo)
async def upload_photo(photo: UploadFile = File(None), db: Session = Depends(get_db),
                       user: User = Depends(authenticate_route)):
    if photo is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="no photo received")

    # Read file into a buffered I/O
    raw_file = await photo.read()
    image_file = io.BytesIO(raw_file)

    try:
        orig_image = Image.open(image_file)
    except UnidentifiedImageError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="invalid photo upload")

    # Create thumbnail with max size
    thumbnail_image = orig_image.copy()
    thumbnail_image.thumbnail(THUMBNAIL_MAX_RES)

    # Save to buffered I/O
    thumbnail_file = io.BytesIO()
    thumbnail_image.save(thumbnail_file, format="jpeg")

    # Get image details
    photo_id = uuid.uuid4().hex
    file_name = photo.filename
    width, height = orig_image.size
    size = float(image_file.getbuffer().nbytes) / float(10 ** 6)
    file_type = orig_image.format.lower()

    image_s3_key = f"{photo_id}.{file_type}"
    thumbnail_s3_key = f"{photo_id}_thumb.jpeg"

    # Move file pointers to start of file
    image_file.seek(0)
    thumbnail_file.seek(0)

    # Upload photo and thumbnail to S3
    s3_client = boto3.client("s3", region_name=AWS_REGION_NAME)
    try:
        s3_client.upload_fileobj(image_file, S3_BUCKET, image_s3_key)
        s3_client.upload_fileobj(thumbnail_file, S3_BUCKET, thumbnail_s3_key)
    except ClientError:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="s3 upload failed")

    uploaded_photo = PhotoBase(
        id=photo_id,
        email=user.email,
        file_name=file_name,
        s3_key=image_s3_key,
        s3_thumbnail_key=thumbnail_s3_key,
        file_type=file_type,
        height=height,
        width=width,
        size=size,
    )
    db_photo = database.photos.add_photo(db, uploaded_photo)
    response = Photo.from_orm(db_photo)
    return response


@router.get("", status_code=status.HTTP_200_OK, response_model=GetPhotosResponse)
def get_photos(start: int, count: int, db: Session = Depends(get_db), user: User = Depends(authenticate_route)):
    total: int = database.photos.get_num_photos(db, user.email)
    has_more = total > start + count

    photos = database.photos.get_photos(db, user.email, start, count)
    photos: List[Photo] = [Photo.from_orm(photo) for photo in photos]

    s3_client = boto3.client("s3", region_name=AWS_REGION_NAME)

    for i, photo in enumerate(photos):
        try:
            signed_url = s3_client.generate_presigned_url("get_object",
                                                          Params={
                                                              "Bucket": S3_BUCKET,
                                                              "Key": photo.s3_key,
                                                              "ResponseContentDisposition": FILE_NAME_PARAM.format(
                                                                  file_name=photo.file_name),
                                                          },
                                                          ExpiresIn=SIGNED_URL_DURATION)

            thumbnail_signed_url = s3_client.generate_presigned_url("get_object",
                                                                    Params={
                                                                        "Bucket": S3_BUCKET,
                                                                        "Key": photo.s3_thumbnail_key,
                                                                    },
                                                                    ExpiresIn=SIGNED_URL_DURATION)
        except ClientError:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="signing URL failed")

        photos[i].url = signed_url
        photos[i].thumbnail_url = thumbnail_signed_url

    response = GetPhotosResponse(
        items=photos,
        has_more=has_more,
        total=total,
    )
    return response


@router.get("/{photo_id}", status_code=status.HTTP_200_OK, response_model=Photo)
def get_photo_by_id(photo_id: str, db: Session = Depends(get_db), user: User = Depends(authenticate_route)):
    db_photo = database.photos.get_photo_by_id(db, photo_id)
    if db_photo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="photo not found")

    if db_photo.email != user.email:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="you don't have permission to view this photo")

    photo = Photo.from_orm(db_photo)
    s3_client = boto3.client("s3", region_name=AWS_REGION_NAME)
    try:
        signed_url = s3_client.generate_presigned_url("get_object",
                                                      Params={
                                                          "Bucket": S3_BUCKET,
                                                          "Key": photo.s3_key,
                                                          "ResponseContentDisposition": FILE_NAME_PARAM.format(
                                                              file_name=photo.file_name),
                                                      },
                                                      ExpiresIn=SIGNED_URL_DURATION)
    except ClientError:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="signing URL failed")

    photo.url = signed_url
    return photo


@router.delete("/{photo_id}", status_code=status.HTTP_200_OK)
def delete_photo_by_id(photo_id: str, db: Session = Depends(get_db), user: User = Depends(authenticate_route)):
    db_photo = database.photos.get_photo_by_id(db, photo_id)
    if db_photo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="photo not found")

    if db_photo.email != user.email:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="you don't have permission to do that")

    # Delete photo from S3
    photo = Photo.from_orm(db_photo)
    s3_client = boto3.client("s3", region_name=AWS_REGION_NAME)
    try:
        s3_client.delete_object(Bucket=S3_BUCKET, Key=photo.s3_key)
        s3_client.delete_object(Bucket=S3_BUCKET, Key=photo.s3_thumbnail_key)
    except ClientError:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="s3 delete failed")

    database.photos.delete_photo(db, photo_id)
