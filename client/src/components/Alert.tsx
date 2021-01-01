import React, { useState } from 'react';

import { CSSTransition } from 'react-transition-group';

type AlertProps = {
  visible: boolean;
};

const Alert: React.FC<AlertProps> = ({ visible }: AlertProps) => {
  return (
    <CSSTransition in={visible} timeout={300} classNames="alert" unmountOnExit>
      <div className="fixed top-0 right-0">
        <div className="p-10">
          <div
            className="bg-emerald-400 border-l-4 border-emerald-600 px-9 py-4 rounded-md shadow-md"
            role="alert"
            style={{ cursor: 'pointer' }}
          >
            <h2 className="font-default font-medium text-emerald">Account created!</h2>
            <p className="font-default text-emerald">Please sign in to continue.</p>
          </div>
        </div>
      </div>
    </CSSTransition>
  );
};

export default Alert;
