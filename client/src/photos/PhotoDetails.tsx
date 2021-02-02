import { Photo, getPhotoById } from './photoHandler';
import React, { useEffect, useState } from 'react';
import { clearError, signInFailed } from '../auth/authSlice';
import { getAuthenticatedUser, getUserByEmail } from '../users/userHandler';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RootState } from '../store';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

type PageParamType = {
  id: string;
};

const PhotoDetails: React.FC = () => {
  const { id } = useParams<PageParamType>();
  const history = useHistory();
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  const [photo, setPhoto] = useState<Photo>();
  const [author, setAuthor] = useState<string>();
  const [showSpinner, setShowSpinner] = useState(false);
  const [initFinished, setInitFinished] = useState(false);

  const processDate = (date: string): string => {
    const dateObj = new Date(date);
    const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(dateObj);
    const month = new Intl.DateTimeFormat('en', { month: 'long' }).format(dateObj);
    const day = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(dateObj);

    return `${month} ${day}, ${year}`;
  };

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getAuthenticatedUser();
      if (user == null) {
        dispatch(signInFailed);
        return;
      }
      setInitFinished(true);
    };
    fetchUser();

    const fetchPhoto = async () => {
      if (initFinished) {
        if (authState.error || !authState.signedIn) {
          dispatch(clearError());
          history.push('/login');
        }

        const photoRes = await getPhotoById(id);
        if (photoRes == null) {
          history.push('/photos');
          return;
        }

        const userRes = await getUserByEmail(photoRes.user);
        if (userRes == null) {
          history.push('/photos');
          return;
        }

        setPhoto(photoRes);
        setAuthor(userRes.name);
      }
    };

    fetchPhoto();
  }, [initFinished]);

  return (
    <>
      {photo != null && author != null && !showSpinner && (
        <div className="flex max-h-screen flex-row p-6 space-x-3">
          <div className="w-60 flex-none text-right pr-12 pt-6">
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="text-3xl cursor-pointer hover:text-emerald-400"
              onClick={() => history.push('/photos')}
            />
          </div>
          <div className="flex-auto">
            {photo == null ? (
              <p>Error</p>
            ) : (
              <img
                src={photo.url}
                className="flex shadow rounded overflow-hidden items-center justify-center"
                onLoad={() => setShowSpinner(false)}
              />
            )}
          </div>
          <div className="pl-9 pt-6 w-1/4 flex-none">
            <h2 className="font-default font-medium text-4xl mb-6">{photo.filename}</h2>
            <p className="font-default">
              By&nbsp;<span className="text-emerald-400 font-medium">{photo.user}</span>
            </p>
            <p className="font-default">{`Uploaded ${processDate(photo.uploaded_at)}`}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoDetails;
