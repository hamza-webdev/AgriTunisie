import React from 'react';
export const Card = ({ children, className = '' }) =>
    (<div className={`bg-white shadow-lg rounded-lg p-6 ${className}`}>{children}</div>);
