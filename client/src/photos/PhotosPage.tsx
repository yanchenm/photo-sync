import React, { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PhotoCard from './PhotoCard';
import PhotoDetails from './PhotoDetails';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const PhotosPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const showDetails = (id: number) => {
    setShowModal(true);
  };

  const hideDetails = () => {
    setShowModal(false);
  };

  return (
    <div className="flex justify-center">
      <PhotoDetails onClose={hideDetails} show={showModal} />
      <div className="max-w-3/4">
        <div className="relative flex w-full flex-wrap items-stretch mb-3">
          <span className="z-10 h-full leading-snug font-normal text-center text-gray-400 absolute bg-transparent rounded text-base items-center justify-center w-8 pl-3 py-3">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            type="text"
            placeholder="Search"
            className="px-3 py-3 placeholder-gray-400 text-gray-700 relative bg-gray-100 rounded text-sm shadow outline-none focus:outline-none focus:shadow-outline w-full pl-10"
          />
        </div>
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
