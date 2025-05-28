export const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false, Icon }) => {
    const baseStyle = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = { primary: "text-white bg-green-600 hover:bg-green-700 focus:ring-green-500", secondary: "text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500", danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500", ghost: "text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-500" };
    const disabledStyle = "opacity-50 cursor-not-allowed";
    return (<button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${disabled ? disabledStyle : ''} ${className}`}>{Icon && <Icon className="mr-2 h-5 w-5" />}{children}</button>);
};