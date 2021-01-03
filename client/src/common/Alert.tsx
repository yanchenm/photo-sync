import { CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

type AlertProps = {
  visible: boolean;
  positive: boolean;
  header: string;
  body: string;
  onClose: () => void;
  clickable: boolean;
  onClick?: () => void;
};

const Alert: React.FC<AlertProps> = ({ visible, positive, header, body, onClose, clickable, onClick }: AlertProps) => {
  return (
    <CSSTransition in={visible} timeout={300} classNames="alert" unmountOnExit>
      <div className="fixed top-0 right-0">
        <div className="p-10">
          <div
            className={`${
              positive ? 'bg-emerald-400 border-emerald-600' : 'bg-red-400 border-red-600'
            } border-l-4 rounded-md shadow-md px-9 py-4 max-w-sm`}
            role="alert"
            style={{ cursor: `${clickable ? 'pointer' : ''}` }}
            onClick={clickable && onClick != null ? () => onClick() : undefined}
          >
            <button
              className="px-n7 py-n4 ml-auto bg-transparent border-0 opacity-6 float-right text-xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faTimes} color="black" />
            </button>
            <h2 className={`font-default font-medium ${positive ? 'text-emerald' : 'text-red'}`}>{header}</h2>
            <p className={`font-default ${positive ? 'text-emerald' : 'text-red'}`}>{body}</p>
          </div>
        </div>
      </div>
    </CSSTransition>
  );
};

export default Alert;
