// Service Parcelles (Répété ici, serait dans src/services/parcelleService.js)
export const parcelleService = {
    getUserParcelles: async (page = 1, limit = 10) => apiService.get(`/parcelles/user?page=${page}&limit=${limit}`),
    getParcelleById: async (id) => apiService.get(`/parcelles/${id}`),
    createParcelle: async (parcelleData) => apiService.post('/parcelles', parcelleData),
    updateParcelle: async (id, parcelleData) => apiService.put(`/parcelles/${id}`, parcelleData),
    deleteParcelle: async (id) => apiService.delete(`/parcelles/${id}`),
};

// Composants UI Communs (Répétés ici, seraient dans src/components/common/)
export const Input = ({ type = 'text', placeholder, value, onChange, name, label, required, error }) => (
    <div className="mb-4">
        {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>}
        <input type={type} id={name} name={name} placeholder={placeholder} value={value} onChange={onChange} required={required} className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`} />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);
export const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false, Icon }) => {
    const baseStyle = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = { primary: "text-white bg-green-600 hover:bg-green-700 focus:ring-green-500", secondary: "text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500", danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500", ghost: "text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-500" };
    const disabledStyle = "opacity-50 cursor-not-allowed";
    return (<button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${disabled ? disabledStyle : ''} ${className}`}>{Icon && <Icon className="mr-2 h-5 w-5" />}{children}</button>);
};
export const Card = ({ children, className = '' }) => (<div className={`bg-white shadow-lg rounded-lg p-6 ${className}`}>{children}</div>);
export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"><div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto"><div className="flex justify-between items-center p-4 border-b"><h3 className="text-lg font-semibold text-gray-800">{title}</h3><button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button></div><div className="p-4">{children}</div></div></div>);
};
export const LoadingSpinner = ({ size = 'md' }) => {
    const sizes = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-16 w-16' };
    return (<div className="flex justify-center items-center"><div className={`${sizes[size]} animate-spin rounded-full border-4 border-green-500 border-t-transparent`}></div></div>);
};
export const Alert = ({ message, type = 'info', onClose }) => {
    const baseStyle = "p-4 mb-4 rounded-md flex items-center justify-between";
    const types = { info: "bg-blue-100 text-blue-700", success: "bg-green-100 text-green-700", warning: "bg-yellow-100 text-yellow-700", error: "bg-red-100 text-red-700" };
    const icons = { info: <Info size={20} className="mr-2" />, success: <CheckCircle size={20} className="mr-2" />, warning: <AlertTriangle size={20} className="mr-2" />, error: <XCircle size={20} className="mr-2" /> };
    if (!message) return null;
    return (<div className={`${baseStyle} ${types[type]}`} role="alert"><div className="flex items-center">{icons[type]}<span>{message}</span></div>{onClose && (<button onClick={onClose} className="ml-4"><X size={20} /></button>)}</div>);
};