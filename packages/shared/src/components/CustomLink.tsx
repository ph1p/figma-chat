import React from 'react';
import { useNavigate, useMatch } from 'react-router-dom';

export const CustomLink = ({
  children,
  to,
  style = {},
  className = '',
}: any) => {
  const navigate = useNavigate();
  const match = useMatch({
    path: to,
  });

  return (
    <div
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        ...style,
      }}
      onClick={() => navigate(to)}
      className={match ? `${className} active` : className}
    >
      {children}
    </div>
  );
};
