import React, { FunctionComponent } from 'react';

const ChatIcon: FunctionComponent = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="10" fill="none">
      <path stroke="#000" d="M6.5 1H9a3 3 0 013 3v2H6.5a2.5 2.5 0 010-5z" />
      <path
        fill="#fff"
        stroke="#000"
        d="M5.5 4H4a3 3 0 00-3 3v2h4.5a2.5 2.5 0 000-5z"
      />
    </svg>
  );
};

export default ChatIcon;
