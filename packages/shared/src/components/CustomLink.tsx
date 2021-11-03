import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

export const CustomLink = ({
  children,
  to,
  style = {},
  className = '',
}: any) => {
  const history = useHistory();
  const match = useRouteMatch({
    path: to,
    exact: true,
  });

  return (
    <div
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        ...style,
      }}
      onClick={() => history.push(to)}
      className={match ? `${className} active` : className}
    >
      {children}
    </div>
  );
};
