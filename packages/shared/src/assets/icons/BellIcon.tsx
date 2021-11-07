import React, { FunctionComponent } from 'react';

interface Props {
  active?: boolean;
}

const BellIcon: FunctionComponent<Props> = (props) => {
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
          fillRule="evenodd"
          d="M17.435 10.308V13.847c0 .977.792 1.77 1.769 1.77v.884H5.049v-.885a1.77 1.77 0 001.77-1.77v-3.538a5.308 5.308 0 0110.616 0zm-5.309 8.644a1.566 1.566 0 01-1.566-1.567H9.269a2.857 2.857 0 005.714 0h-1.29c0 .865-.702 1.567-1.567 1.567z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" fill="none">
      <path
        fill="#A2ADC0"
        fillRule="evenodd"
        d="M17.435 10.308V13.847c0 .977.792 1.77 1.769 1.77v.884H5.049v-.885a1.77 1.77 0 001.77-1.77v-3.538a5.308 5.308 0 0110.616 0zm-5.309 8.644a1.566 1.566 0 01-1.566-1.567H9.269a2.857 2.857 0 005.714 0h-1.29c0 .865-.702 1.567-1.567 1.567z"
        clipRule="evenodd"
      />
      <path
        fill="#A2ADC0"
        stroke="#ECEFF4"
        d="M20.678 3.293l1.414 1.414L3.707 23.092l-1.414-1.414z"
      />
    </svg>
  );
};

export default BellIcon;
