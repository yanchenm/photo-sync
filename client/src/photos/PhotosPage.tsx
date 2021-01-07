import React, { useEffect, useState } from 'react';
import { clearError, tryRefresh } from '../auth/authSlice';
import { faBookOpen, faImages, faShareSquare } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PhotoCard from './PhotoCard';
import PhotoDetails from './PhotoDetails';
import { RootState } from '../store';
import { useHistory } from 'react-router-dom';

const PhotosPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const authState = useSelector((state: RootState) => state.auth);

  const dispatch = useDispatch();
  const history = useHistory();

  const showDetails = (id: number) => {
    setShowModal(true);
  };

  const hideDetails = () => {
    setShowModal(false);
  };

  useEffect(() => {
    if (!authState.signedIn && !authState.error) {
      dispatch(tryRefresh());
    }

    if (authState.error) {
      dispatch(clearError());
      history.push('/login');
    }
  });

  return (
    <div className="flex justify-center flex-auto">
      <PhotoDetails onClose={hideDetails} show={showModal} />
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4" style={{ margin: '30px' }}>
          <PhotoCard id={0} onClick={showDetails} />
          <PhotoCard id={1} onClick={showDetails} />
          <PhotoCard id={2} onClick={showDetails} />
          <PhotoCard id={3} onClick={showDetails} />
        </div>
      </div>
    </div>
  );
};

export default PhotosPage;
