import React from 'react';

const Badge = ({ type = 'default', children }) => {
  return (
    <span className={`badge badge-${type}`}>
      {children}
    </span>
  );
};

export default Badge;