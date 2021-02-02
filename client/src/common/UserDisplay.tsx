import React, { useRef, useState } from 'react';
import { faChevronDown, faChevronUp, faSignOutAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import OutsideClickHandler from 'react-outside-click-handler';
import { User } from '../users/userHandler';
import { usePopper } from 'react-popper';

type UserDisplayProps = {
  user: User;
  onSignOut: () => void;
};

const UserDisplay: React.FC<UserDisplayProps> = ({ user, onSignOut }: UserDisplayProps) => {
  const [showPopper, setShowPopper] = useState(false);
  const userDisplayRef = useRef(null);
  const popperRef = useRef(null);
  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(userDisplayRef.current, popperRef.current, {
    placement: 'top',
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
          offset: [10, 10],
        },
      },
    ],
  });

  return (
    <div className="w-full overflow-hidden cursor-pointer">
      <OutsideClickHandler onOutsideClick={() => setShowPopper(false)}>
        <div
          className="flex flex-row justify-between items-center pl-6 pb-3 text-xl"
          onClick={() => setShowPopper(!showPopper)}
          ref={userDisplayRef}
        >
          <div className="flex overflow-hidden truncate flex-row space-x-3 items-center justify-center">
            <FontAwesomeIcon icon={faUserCircle} />
            <p className="font-default overflow-hidden truncate">{user.name}</p>
          </div>
          {showPopper ? (
            <FontAwesomeIcon icon={faChevronDown} className="flex-none ml-2" />
          ) : (
            <FontAwesomeIcon icon={faChevronUp} className="flex-none ml-2" />
          )}
        </div>

        {showPopper ? (
          <div
            ref={popperRef}
            style={styles.popper}
            {...attributes.popper}
            className="p-4 bg-white border shadow rounded"
          >
            <div ref={setArrowRef} />
            <div
              className="flex flex-row items-center font-default text-lg cursor-pointer hover:text-red-600"
              onClick={onSignOut}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
              Sign Out
            </div>
          </div>
        ) : null}
      </OutsideClickHandler>
    </div>
  );
};

export default UserDisplay;
