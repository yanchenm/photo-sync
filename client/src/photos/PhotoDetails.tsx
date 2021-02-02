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
  const [showSpinner, setShowSpinner] = useState(true);
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

  useEffect(() => {
    if (initFinished) {
      if (authState.error || !authState.signedIn) {
        dispatch(clearError());
        history.push('/login');
      }
    }
  });

  return (
    <>
      {photo != null && author != null && (
        <div className="flex max-h-screen flex-row p-6 space-x-3">
          <div className="w-60 flex-none text-right pr-12 pt-6">
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="text-3xl cursor-pointer hover:text-emerald-400"
              onClick={() => history.push('/photos')}
            />
          </div>
          <div className="flex-auto flex-col items-center justify-center">
            <img
              src={photo.url}
              className={`${
                showSpinner ? 'hidden' : 'visible'
              } flex max-h-full max-w-full shadow rounded overflow-hidden items-center justify-center`}
              onLoad={() => setShowSpinner(false)}
            />
            <div className="flex flex-row h-screen items-center justify-center">
              <div
                className={`${
                  showSpinner ? 'visible' : 'hidden'
                } loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24`}
              />
            </div>
          </div>
          <div className="pl-9 pt-6 w-1/4 flex-none">
            <h2 className="font-default font-medium text-4xl pb-6 overflow-hidden truncate">{photo.filename}</h2>
            <p className="font-default">
              By&nbsp;<span className="text-emerald-400 font-medium">{author}</span>
            </p>
            <p className="font-default">{`Uploaded ${processDate(photo.uploaded_at)}`}</p>
            <p className="font-default mt-6">
              <span className="font-medium">Type:&nbsp;</span>
              {photo.details.file_type}
            </p>
            <p className="font-default">
              <span className="font-medium">Dimensions:&nbsp;</span>
              {`${photo.details.width} x ${photo.details.height}`}
            </p>
            <p className="font-default">
              <span className="font-medium">Size:&nbsp;</span>
              {`${photo.details.size.toFixed(2)} MB`}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoDetails;
