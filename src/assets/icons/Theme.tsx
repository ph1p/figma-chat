import React, { FunctionComponent } from 'react';

interface Props {
  active?: boolean;
}

const ThemeIcon: FunctionComponent<Props> = (props) => {
  if (props.active) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="31"
        fill="none"
      >
        <g filter="url(#filter0_d)">
          <circle cx="15" cy="12" r="5" fill="#626E81" />
          <circle
            cx="15"
            cy="12"
            r="10"
            stroke="#626E81"
            strokeDasharray="1 10"
            strokeWidth="2"
          />
        </g>
        <defs>
          <filter
            id="filter0_d"
            width="32"
            height="32"
            x="-1"
            y="0"
            colorInterpolationFilters="sRGB"
            filterUnits="userSpaceOnUse"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend
              in="SourceGraphic"
              in2="effect1_dropShadow"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
      <g clipPath="url(#clip0)">
        <path
          fill="#A2ADC0"
          d="M4.262 18.192a9.31 9.31 0 01-.725-.816.391.391 0 01-.011-.466.392.392 0 01.443-.141c3.284 1.141 6.966.209 9.608-2.435 2.644-2.644 3.577-6.326 2.435-9.607a.39.39 0 01.376-.515.39.39 0 01.231.082c.29.23.57.478.83.737a9.203 9.203 0 012.65 5.485 9.257 9.257 0 01-1.939 6.86C14.978 21.41 9.11 22.1 5.078 18.92a9.521 9.521 0 01-.816-.727z"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <path fill="#fff" d="M0 0h24v24H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ThemeIcon;
