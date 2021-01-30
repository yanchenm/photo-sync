import { Photo, getPhotoById } from './photoHandler';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RootState } from '../store';
import { clearError } from '../auth/authSlice';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { tryRefresh } from '../auth/authHandler';

type PageParamType = {
  id: string;
};

const PhotoDetails: React.FC = () => {
  const { id } = useParams<PageParamType>();
  const history = useHistory();
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  const [photo, setPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (!authState.signedIn && !authState.error) {
      dispatch(tryRefresh());
    }

    if (authState.error) {
      dispatch(clearError());
      history.push('/login');
    }

    const fetchPhoto = async () => {
      const res = await getPhotoById(id);
      if (res == null) {
        history.push('/photos');
      }
      setPhoto(res);
    };

    fetchPhoto();
  }, [authState]);

  return (
    <div className="min-h-screen flex flex-row p-6 space-x-3">
      <div className="w-60 flex-none min-h-screen text-right pr-12 pt-6">
        <FontAwesomeIcon
          icon={faArrowLeft}
          className="text-3xl cursor-pointer hover:text-emerald-400"
          onClick={() => history.push('/photos')}
        />
      </div>
      <div className="flex-auto max-h-screen">
        {photo == null ? (
          <p>Error</p>
        ) : (
          <img src={photo.url} className="flex shadow rounded overflow-hidden items-center justify-center" />
        )}
      </div>
      <div className="pl-9 pt-6 w-1/4 flex-none">
        <h2 className="font-default font-medium text-4xl">{photo?.filename}</h2>
        <p>{`Uploaded ${photo?.uploaded_at}`}</p>
      </div>
    </div>
  );
};

export default PhotoDetails;
