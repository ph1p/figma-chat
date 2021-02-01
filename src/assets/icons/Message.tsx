import React, { FunctionComponent } from 'react';

interface Props {
  active?: boolean;
}

const MessageIcon: FunctionComponent<Props> = (props) => {
  if (props.active) {
    return (
      <svg
        xmlns="https://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
      >
        <path
          fill="#A2ADC0"
          d="M18.342 18.072h-2.808c-.638 0-1.24.296-1.631.8a2.061 2.061 0 01-3.263 0 2.061 2.061 0 00-1.63-.8H6.2a2.18 2.18 0 01-2.18-2.18V8.603a2.18 2.18 0 012.18-2.18h12.14a2.18 2.18 0 012.181 2.18v7.287a2.18 2.18 0 01-2.18 2.18z"
        />
        <circle cx="19.552" cy="7.394" r="2.912" fill="red" />
      </svg>
    );
  }

  return (
    <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" fill="none">
      <path
        fill="#A2ADC0"
        d="M18.342 18.072h-2.808c-.638 0-1.24.296-1.631.8a2.061 2.061 0 01-3.263 0 2.062 2.062 0 00-1.63-.8H6.2a2.18 2.18 0 01-2.18-2.18V8.603a2.18 2.18 0 012.18-2.18h12.14a2.18 2.18 0 012.181 2.18v7.287a2.18 2.18 0 01-2.18 2.18z"
      />
      <path
        fill="#A2ADC0"
        stroke="#ECEFF4"
        d="M20.678 3.293l1.414 1.414L3.707 23.092l-1.414-1.414z"
      />
    </svg>
  );
};

export default MessageIcon;
