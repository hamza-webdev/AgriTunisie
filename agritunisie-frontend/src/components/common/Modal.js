export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"><div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto"><div className="flex justify-between items-center p-4 border-b"><h3 className="text-lg font-semibold text-gray-800">{title}</h3><button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button></div><div className="p-4">{children}</div></div></div>);
};