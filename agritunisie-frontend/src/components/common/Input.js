import React from 'react';
export const Input = ({ type = 'text', placeholder, value, onChange, name, label, required, error }) => (
    <div className="mb-4">
        {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>}
        <input type={type} id={name} name={name} placeholder={placeholder} value={value} onChange={onChange} required={required} className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);