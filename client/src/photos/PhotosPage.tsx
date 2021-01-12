import { Photo, getPhotos } from './photoHandler';
import React, { useEffect, useState } from 'react';
import { clearError, tryRefresh } from '../auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';

import Gallery from 'react-photo-gallery';
import PhotoCard from './PhotoCard';
import PhotoDetails from './PhotoDetails';
import { RootState } from '../store';
import { useHistory } from 'react-router-dom';

type PhotoGalleryElement = {
  src: string;
  height: number;
  width: number;
};

const PhotosPage: React.FC = () => {
  const [photoList, setPhotoList] = useState<Array<Photo>>([]);
  const authState = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchPhotos = async () => {
      if (authState.accessToken != null) {
        const photos = await getPhotos(authState.accessToken, 0, 10);
        if (photos != null && photos.photos != null) {
          console.log(photos);
          setPhotoList(photos.photos);
        }
      } else {
        setPhotoList([]);
      }
    };

    fetchPhotos();
  }, [authState]);

  const photos = photoList.map((photo) => ({
    src: photo.thumbnail_url,
    height: photo.details.height,
    width: photo.details.width,
  }));

  console.log(photos);

  return (
    <div className="p-4">
      <Gallery photos={photos} />
    </div>
  );
};

export default PhotosPage;
