import React, { FunctionComponent } from 'react';

interface Props {
  active?: boolean;
}

const TrashIcon: FunctionComponent<Props> = (props) => {
  if (props.active) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
      >
        <path
          fill="#A2ADC0"
          d="M9.684 7h5.033c.037 0 .067.03.067.067h2.067v10.33a2.071 2.071 0 01-2.072 2.07H9.622a2.071 2.071 0 01-2.072-2.07V7.066h2.067c0-.037.03-.067.067-.067z"
        />
        <path
          stroke="#A2ADC0"
          strokeWidth="1.381"
          d="M7 7.067h.55m9.95 0h-.65m0 0h-9.3m9.3 0v10.33a2.071 2.071 0 01-2.07 2.07H9.621a2.072 2.072 0 01-2.072-2.07V7.066M7 2.996l1.497.401 1.997.535m8.484 2.274l-1.497-.401-1.996-.535m-4.991-1.338v0a2.067 2.067 0 012.531-1.461l.998.267a2.067 2.067 0 011.462 2.532v0m-4.991-1.338l4.99 1.338"
        />
        <path
          stroke="#ECEFF4"
          strokeWidth="1.381"
          d="M10.65 10.733v4.134m3.1-4.134v4.134"
        />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
      <path
        fill="#A2ADC0"
        d="M9.684 7h5.033c.037 0 .067.03.067.067h2.067v10.33a2.071 2.071 0 01-2.072 2.07H9.622a2.071 2.071 0 01-2.072-2.07V7.066h2.067c0-.037.03-.067.067-.067z"
      />
      <path
        stroke="#A2ADC0"
        strokeWidth="1.381"
        d="M6 7.067h1.55m10.85 0h-1.55m-7.233 0v0c0-1.142.925-2.067 2.067-2.067h1.033c1.142 0 2.067.925 2.067 2.067v0m-5.167 0h5.167m-5.167 0H7.55m7.234 0h2.067m0 0v10.33a2.071 2.071 0 01-2.072 2.07H9.622a2.071 2.071 0 01-2.072-2.07V7.066"
      />
      <path
        stroke="#ECEFF4"
        strokeWidth="1.381"
        d="M10.65 10.733v4.134m3.1-4.134v4.134"
      />
    </svg>
  );
};

export default TrashIcon;
