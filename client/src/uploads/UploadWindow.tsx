import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { UploadStatus } from './uploadSlice';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

type UploadWindowProps = {
  visible: boolean;
  header: string;
  status: { [filename: string]: UploadStatus };
  onClose: () => void;
};

const UploadWindow: React.FC<UploadWindowProps> = ({ visible, header, status, onClose }: UploadWindowProps) => {
  return (
    <div className="fixed bottom-0 right-0">
      <div className="p-10">
        <div className="bg-white rounded-md shadow px-9 py-4 max-w-sm" role="alert">
          <button
            className="px-n7 py-n4 ml-auto bg-transparent border-0 opacity-6 float-right text-xl leading-none font-semibold outline-none focus:outline-none"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} color="black" />
          </button>
          <h2 className="font-default font-medium text-black">{header}</h2>
        </div>
      </div>
    </div>
  );
};

export default UploadWindow;
