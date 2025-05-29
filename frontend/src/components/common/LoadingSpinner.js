import React from 'react';
export const LoadingSpinner = ({ size = 'md' }) => {
    const sizes = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-16 w-16' };
    return (<div className="flex justify-center items-center"><div className={`${sizes[size]} animate-spin rounded-full border-4 border-green-500 border-t-transparent`}></div></div>);
};