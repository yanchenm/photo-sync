import { faCheckCircle, faTimes, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { RootState } from '../store';
import { useSelector } from 'react-redux';

type UploadWindowProps = {
  visible: boolean;
  header: string;
  onClose: () => void;
};

type UploadStatus = 'uploading' | 'completed' | 'error';

const UploadWindow: React.FC<UploadWindowProps> = ({ visible, onClose }: UploadWindowProps) => {
  const uploadState = useSelector((state: RootState) => state.upload);

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'completed':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400 text-xl" />;
      case 'uploading':
        return <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-6 w-6" />;
      case 'error':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 text-xl" />;
    }
  };

  const uploadElements = Object.keys(uploadState.status).map((file) => {
    return (
      <div className="flex flex-row justify-between mt-2" key={file}>
        <p className="overflow-hidden truncate font-default">{file}</p>
        <div className="flex flex-none h-6 w-6 items-center justify-center">
          {getStatusIcon(uploadState.status[file])}
        </div>
      </div>
    );
  });

  return (
    <div>
      {visible && (
        <div className="fixed bottom-0 right-0 w-96">
          <div className="p-10">
            <div className="bg-white border rounded-md shadow px-9 py-4" role="alert">
              <button
                className="px-n7 py-n4 ml-auto bg-transparent border-0 opacity-6 float-right text-xl leading-none font-semibold outline-none focus:outline-none"
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faTimes} color="black" />
              </button>
              <h2 className="font-default font-medium text-lg text-black mb-4">
                {uploadState.uploading ? 'Uploading photos...' : 'Upload complete'}
              </h2>
              <div>{uploadElements}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadWindow;
