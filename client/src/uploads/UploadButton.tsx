import React, { ChangeEvent, MutableRefObject, useRef, useState } from 'react';
import { faCloudUploadAlt, faPlus } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import OutsideClickHandler from 'react-outside-click-handler';
import { startUpload } from './uploadSlice';
import { useDispatch } from 'react-redux';
import { usePopper } from 'react-popper';

const UploadButton: React.FC = () => {
  const [showPopper, setShowPopper] = useState(false);
  const uploadButtonRef = useRef(null);
  const popperRef = useRef(null);
  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);
  const hiddenFileUploadRef = useRef() as MutableRefObject<HTMLInputElement>;

  const dispatch = useDispatch();

  const { styles, attributes } = usePopper(uploadButtonRef.current, popperRef.current, {
    placement: 'right',
    modifiers: [
      {
        name: 'arrow',
        options: {
          element: arrowRef,
        },
      },
      {
        name: 'offset',
        options: {
          offset: [0, 10],
        },
      },
    ],
  });

  const handleUploadClick = () => {
    hiddenFileUploadRef.current.click();
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log(files);

    if (files == null) {
      return;
    }

    for (let i = 0; i < files.length; i++) {
      dispatch(startUpload(files[i]));
    }
  };

  return (
    <div>
      <OutsideClickHandler onOutsideClick={() => setShowPopper(false)}>
        <button
          type="button"
          ref={uploadButtonRef}
          onClick={() => setShowPopper(!showPopper)}
          className="flex flex-row items-center group relative w-full justify-center py-2 px-4 border border-transparent text-xl font-default font-medium rounded-md text-emerald-500 border-emerald-500 focus:outline-none hover:border-emerald-400 hover:text-emerald-400"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-3" />
          New
        </button>

        {showPopper ? (
          <div ref={popperRef} style={styles.popper} {...attributes.popper} className="p-4 bg-white shadow rounded">
            <div ref={setArrowRef} />
            <input
              type="file"
              ref={hiddenFileUploadRef}
              style={{ display: 'none' }}
              accept="image/png, image/jpeg"
              onChange={handleFileUpload}
            />
            <div className="flex flex-col space-y-3">
              <div
                className="flex flex-row items-center font-default text-lg cursor-pointer hover:text-emerald-400"
                onClick={handleUploadClick}
              >
                <FontAwesomeIcon icon={faCloudUploadAlt} className="mr-3" />
                Upload Photo
              </div>
              <div className="flex flex-row items-center font-default text-lg cursor-pointer hover:text-emerald-400 m-0.5">
                <FontAwesomeIcon icon={faPlus} className="mr-3" />
                New Album
              </div>
            </div>
          </div>
        ) : null}
      </OutsideClickHandler>
    </div>
  );
};

export default UploadButton;
