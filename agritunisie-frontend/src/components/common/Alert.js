import React from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

export const Alert = ({ message, type = 'info', onClose }) => {
    const baseStyle = "p-4 mb-4 rounded-md flex items-center justify-between";
    const types = { info: "bg-blue-100 text-blue-700", success: "bg-green-100 text-green-700", warning: "bg-yellow-100 text-yellow-700", error: "bg-red-100 text-red-700" };
    const icons = { info: <Info size={20} className="mr-2" />, success: <CheckCircle size={20} className="mr-2" />, warning: <AlertTriangle size={20} className="mr-2" />, error: <XCircle size={20} className="mr-2" /> };
    if (!message) return null;
    return (<div className={`${baseStyle} ${types[type]}`} role="alert"><div className="flex items-center">{icons[type]}<span>{message}</span></div>{onClose && (<button onClick={onClose} className="ml-4"><X size={20} /></button>)}</div>);
};