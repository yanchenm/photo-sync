import React, { ReactElement, useEffect, useState } from 'react';
import { clearError, tryRefresh } from '../auth/authSlice';
import { clearUploads, setClosed } from '../uploads/uploadSlice';
import { faBookOpen, faImages, faShareSquare } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PhotosPage from '../photos/PhotosPage';
import { RootState } from '../store';
import UploadButton from '../uploads/UploadButton';
import UploadWindow from '../uploads/UploadWindow';

type PageName = 'photos' | 'albums' | 'sharing';

type PageParamType = {
  page: PageName;
};

const renderPage = (page: PageName): ReactElement => {
  switch (page) {
    default:
      return <PhotosPage />;
  }
};

const HomePage: React.FC = () => {
  const authState = useSelector((state: RootState) => state.auth);
  const uploadState = useSelector((state: RootState) => state.upload);
  const [uploadWindowVisible, setUploadWindowVisible] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();
  const { page } = useParams<PageParamType>();

  const closeUploadWindow = () => {
    dispatch(setClosed());
    setUploadWindowVisible(false);
  };

  useEffect(() => {
    dispatch(clearUploads());
  }, []);

  useEffect(() => {
    if (!authState.signedIn && !authState.error) {
      dispatch(tryRefresh());
    }

    if (authState.error) {
      dispatch(clearError());
      history.push('/login');
    }
  });

  useEffect(() => {
    if (uploadState.uploading && !uploadState.closed) {
      setUploadWindowVisible(true);
    }
  });

  return (
    <div className="flex flex-row">
      <div className="flex flex-col items-center w-60 flex-none min-h-screen pl-4 pt-4 pb-4 z-50">
        <h1 className="font-default text-4xl font-bold p-4 mb-6">photos</h1>
        <div className="w-40 mb-10">
          <UploadButton />
        </div>
        <div className="flex flex-col items-start">
          <div
            className={`${
              page == 'photos' ? 'bg-emerald-300' : 'bg-white hover:bg-emerald-200'
            } py-3 px-6 rounded cursor-pointer w-full`}
            onClick={() => history.push('/photos')}
          >
            <div className="flex flex-row w-full items-center space-x-6 text-xl">
              <FontAwesomeIcon icon={faImages} />
              <p className="font-default">Photos</p>
            </div>
          </div>
          <div
            className={`${
              page == 'albums' ? 'bg-emerald-300' : 'bg-white hover:bg-emerald-200'
            } group py-3 px-6 rounded cursor-pointer w-full`}
            onClick={() => history.push('/albums')}
          >
            <div className="flex flex-row w-full items-center space-x-6 text-xl">
              <FontAwesomeIcon icon={faBookOpen} />
              <p className="font-default">Albums</p>
            </div>
          </div>
          <div
            className={`${
              page == 'sharing' ? 'bg-emerald-300' : 'bg-white hover:bg-emerald-200'
            } group py-3 px-6 rounded cursor-pointer w-full`}
            onClick={() => history.push('/sharing')}
          >
            <div className="flex flex-row w-full items-center space-x-6 text-xl">
              <FontAwesomeIcon icon={faShareSquare} />
              <p className="font-default">Sharing</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-scroll">{renderPage(page)}</div>
      </div>

      <UploadWindow visible={uploadWindowVisible} header="Uploading Photos..." onClose={() => closeUploadWindow()} />
    </div>
  );
};

export default HomePage;
