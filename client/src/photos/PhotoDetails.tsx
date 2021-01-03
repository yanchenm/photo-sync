import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

type PhotoDetailsProps = {
  id?: number;
  onClose: () => void;
  show: boolean;
};

const PhotoDetails: React.FC<PhotoDetailsProps> = ({ id, onClose, show }: PhotoDetailsProps) => {
  return (
    <>
      {show ? (
        <>
          <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
            onClick={onClose}
          >
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="flex items-start justify-between rounded-t">
                  <button
                    className="p-2 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={onClose}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                <div className="relative p-6 flex-auto">
                  <img src="https://picsum.photos/600/400/?random"></img>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
};

export default PhotoDetails;
