import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Shield, LogIn, UserPlus, MapPinned, PlusCircle, Home, LogOut, Sun, Moon, Leaf, Tractor, ShoppingCart, MessageSquare, BarChart3, AlertTriangle, Settings, ChevronDown, Search, Filter, Edit3, Trash2, Info, Eye, EyeOff, UploadCloud, CheckCircle, XCircle, CalendarDays, Users, DollarSign, Brain, Menu, X } from 'lucide-react';

// Configuration de l'API
// Correction pour l'erreur "process is not defined"
const getApiBaseUrl = () => {
    try {
        if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
            return process.env.REACT_APP_API_URL;
        }
    } catch (e) {
        // Erreur si process.env n'est pas accessible comme attendu (ex: certains contextes d'exécution stricts)
        console.warn("Impossible d'accéder à process.env.REACT_APP_API_URL, utilisation de l'URL par défaut.", e);
    }
    return 'http://localhost:3001/api'; // URL par défaut
};
const API_BASE_URL = getApiBaseUrl();


// Contexte d'Authentification
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('agritunisie_token'));
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => { // Déplacer logout ici pour qu'il soit défini avant d'être utilisé dans useEffect
        setToken(null);
        setUser(null);
        localStorage.removeItem('agritunisie_token');
        localStorage.removeItem('agritunisie_user');
    }, []);


    useEffect(() => {
        if (token) {
            try {
                const storedUser = localStorage.getItem('agritunisie_user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    logout();
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de l'utilisateur depuis localStorage", error);
                logout(); 
            }
        }
        setLoading(false);
    }, [token, logout]);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Échec de la connexion');
            }
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('agritunisie_token', data.token);
            localStorage.setItem('agritunisie_user', JSON.stringify(data.user));
            return data;
        } catch (error) {
            console.error("Erreur de connexion:", error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Échec de l\'inscription');
            }
            return data;
        } catch (error) {
            console.error("Erreur d'inscription:", error);
            throw error;
        }
    };


    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

// Service API générique (pour les appels authentifiés)
const apiService = {
    get: async (endpoint) => {
        const token = localStorage.getItem('agritunisie_token');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            if (response.status === 401) { 
                console.warn("API call returned 401, token might be expired.");
            }
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Erreur API: ${response.status}`);
        }
        return response.json();
    },
    post: async (endpoint, data) => {
        const token = localStorage.getItem('agritunisie_token');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Erreur API: ${response.status}`);
        }
        return response.json();
    },
    put: async (endpoint, data) => {
        const token = localStorage.getItem('agritunisie_token');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Erreur API: ${response.status}`);
        }
        return response.json();
    },
    delete: async (endpoint) => {
        const token = localStorage.getItem('agritunisie_token');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Erreur API: ${response.status}`);
        }
        return response.json(); 
    },
};


// Composants UI Communs
const Input = ({ type = 'text', placeholder, value, onChange, name, label, required, error }) => (
    <div className="mb-4">
        {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>}
        <input
            type={type}
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false, Icon }) => {
    const baseStyle = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = {
        primary: "text-white bg-green-600 hover:bg-green-700 focus:ring-green-500",
        secondary: "text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500",
        danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
        ghost: "text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-500",
    };
    const disabledStyle = "opacity-50 cursor-not-allowed";

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variants[variant]} ${disabled ? disabledStyle : ''} ${className}`}
        >
            {Icon && <Icon className="mr-2 h-5 w-5" />}
            {children}
        </button>
    );
};

const Card = ({ children, className = '' }) => (
    <div className={`bg-white shadow-lg rounded-lg p-6 ${className}`}>
        {children}
    </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

const LoadingSpinner = ({ size = 'md' }) => {
    const sizes = {
        sm: 'h-6 w-6',
        md: 'h-10 w-10',
        lg: 'h-16 w-16',
    };
    return (
        <div className="flex justify-center items-center">
            <div className={`${sizes[size]} animate-spin rounded-full border-4 border-green-500 border-t-transparent`}></div>
        </div>
    );
};

const Alert = ({ message, type = 'info', onClose }) => {
    const baseStyle = "p-4 mb-4 rounded-md flex items-center justify-between";
    const types = {
        info: "bg-blue-100 text-blue-700",
        success: "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-700",
        error: "bg-red-100 text-red-700",
    };
    const icons = {
        info: <Info size={20} className="mr-2" />,
        success: <CheckCircle size={20} className="mr-2" />,
        warning: <AlertTriangle size={20} className="mr-2" />,
        error: <XCircle size={20} className="mr-2" />,
    };

    if (!message) return null;

    return (
        <div className={`${baseStyle} ${types[type]}`} role="alert">
            <div className="flex items-center">
                {icons[type]}
                <span>{message}</span>
            </div>
            {onClose && (
                <button onClick={onClose} className="ml-4">
                    <X size={20} />
                </button>
            )}
        </div>
    );
};


// Composants de Layout
const Navbar = ({ navigateTo }) => {
    const { user, logout, isAuthenticated } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigateTo('login');
    };
    
    const navItems = [
        { name: 'Accueil', page: 'home', icon: Home, authRequired: false },
        { name: 'Mes Parcelles', page: 'parcelles', icon: MapPinned, authRequired: true },
        { name: 'Catalogue Cultures', page: 'cultures', icon: Leaf, authRequired: false },
        { name: 'Élevage', page: 'elevage', icon: Tractor, authRequired: true },
        { name: 'Bourse des Prix', page: 'prix', icon: ShoppingCart, authRequired: false },
        { name: 'Météo', page: 'meteo', icon: Sun, authRequired: true },
        { name: 'Communauté', page: 'communaute', icon: MessageSquare, authRequired: true },
        { name: 'Conseils IA', page: 'gemini', icon: Brain, authRequired: true },
    ];

    return (
        <nav className="bg-white shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Shield className="h-8 w-8 text-green-600" />
                        <span 
                            className="font-bold text-xl text-green-700 ml-2 cursor-pointer"
                            onClick={() => navigateTo('home')}
                        >
                            AgriTunisie
                        </span>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navItems.filter(item => !item.authRequired || isAuthenticated).map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => navigateTo(item.page)}
                                    className="text-gray-600 hover:bg-green-50 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                                >
                                    <item.icon size={18} className="mr-1" /> {item.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:block">
                        {isAuthenticated && user ? (
                            <div className="ml-4 flex items-center md:ml-6">
                                <span className="text-gray-700 text-sm mr-3">Bonjour, {user.nom_complet || user.email}</span>
                                <Button onClick={handleLogout} variant="secondary" Icon={LogOut}>Déconnexion</Button>
                            </div>
                        ) : (
                            <div className="space-x-2">
                                <Button onClick={() => navigateTo('login')} variant="primary" Icon={LogIn}>Connexion</Button>
                                <Button onClick={() => navigateTo('register')} variant="secondary" Icon={UserPlus}>Inscription</Button>
                            </div>
                        )}
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            type="button"
                            className="bg-green-50 inline-flex items-center justify-center p-2 rounded-md text-green-600 hover:text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Ouvrir le menu principal</span>
                            {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menu Mobile */}
            {isMobileMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navItems.filter(item => !item.authRequired || isAuthenticated).map((item) => (
                             <button
                                key={item.name}
                                onClick={() => { navigateTo(item.page); setIsMobileMenuOpen(false); }}
                                className="text-gray-600 hover:bg-green-50 hover:text-green-700 block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center"
                            >
                                <item.icon size={18} className="mr-2" /> {item.name}
                            </button>
                        ))}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        {isAuthenticated && user ? (
                            <div className="px-5">
                                <div className="text-base font-medium text-gray-800">{user.nom_complet || user.email}</div>
                                <div className="text-sm font-medium text-gray-500">{user.email}</div>
                                <Button onClick={() => {handleLogout(); setIsMobileMenuOpen(false);}} variant="secondary" Icon={LogOut} className="mt-3 w-full">Déconnexion</Button>
                            </div>
                        ) : (
                            <div className="px-2 space-y-2">
                                <Button onClick={() => {navigateTo('login'); setIsMobileMenuOpen(false);}} variant="primary" Icon={LogIn} className="w-full">Connexion</Button>
                                <Button onClick={() => {navigateTo('register'); setIsMobileMenuOpen(false);}} variant="secondary" Icon={UserPlus} className="w-full">Inscription</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

const Footer = () => (
    <footer className="bg-gray-100 border-t mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} AgriTunisie Connect. Tous droits réservés.</p>
            <p className="text-xs text-gray-400 mt-1">Développé avec passion pour l'agriculture tunisienne.</p>
        </div>
    </footer>
);

const MainLayout = ({ children, navigateTo }) => (
    <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar navigateTo={navigateTo} />
        <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {children}
        </main>
        <Footer />
    </div>
);

// Pages
const HomePage = ({ navigateTo }) => (
    <Card className="text-center">
        <Shield size={64} className="mx-auto text-green-600 mb-4" />
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Bienvenue sur AgriTunisie Connect</h1>
        <p className="text-lg text-gray-600 mb-6">Votre partenaire numérique pour une agriculture prospère et durable en Tunisie.</p>
        <div className="space-x-4">
            <Button onClick={() => navigateTo('parcelles')} variant="primary" Icon={MapPinned}>Voir Mes Parcelles</Button>
            <Button onClick={() => navigateTo('cultures')} variant="secondary" Icon={Leaf}>Explorer les Cultures</Button>
        </div>
    </Card>
);

const LoginPage = ({ navigateTo }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoadingState] = useState(false); // Renommé pour éviter conflit avec 'loading' de AuthContext
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoadingState(true);
        try {
            await login(email, password);
            navigateTo('dashboard'); 
        } catch (err) {
            setError(err.message || 'Erreur de connexion. Veuillez vérifier vos identifiants.');
        } finally {
            setLoadingState(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <Card>
                <div className="text-center mb-6">
                    <LogIn size={48} className="mx-auto text-green-600" />
                    <h2 className="text-2xl font-bold text-gray-800 mt-2">Connexion</h2>
                </div>
                {error && <Alert message={error} type="error" onClose={() => setError('')} />}
                <form onSubmit={handleSubmit}>
                    <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input label="Mot de passe" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Button type="submit" variant="primary" className="w-full" disabled={loading} Icon={loading ? null : LogIn}>
                        {loading ? <LoadingSpinner size="sm" /> : 'Se Connecter'}
                    </Button>
                </form>
                <p className="text-sm text-center mt-4">
                    Pas encore de compte ?{' '}
                    <button onClick={() => navigateTo('register')} className="font-medium text-green-600 hover:text-green-500">
                        Inscrivez-vous
                    </button>
                </p>
            </Card>
        </div>
    );
};

const RegisterPage = ({ navigateTo }) => {
    const [nomComplet, setNomComplet] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [numeroTelephone, setNumeroTelephone] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoadingState] = useState(false); // Renommé
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        setError('');
        setSuccess('');
        setLoadingState(true);
        try {
            await register({ nom_complet: nomComplet, email, mot_de_passe: password, numero_telephone: numeroTelephone });
            setSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.");
            setTimeout(() => navigateTo('login'), 2000);
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'inscription.');
        } finally {
            setLoadingState(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <Card>
                <div className="text-center mb-6">
                    <UserPlus size={48} className="mx-auto text-green-600" />
                    <h2 className="text-2xl font-bold text-gray-800 mt-2">Inscription</h2>
                </div>
                {error && <Alert message={error} type="error" onClose={() => setError('')} />}
                {success && <Alert message={success} type="success" onClose={() => setSuccess('')} />}
                <form onSubmit={handleSubmit}>
                    <Input label="Nom complet" name="nomComplet" value={nomComplet} onChange={(e) => setNomComplet(e.target.value)} required />
                    <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input label="Numéro de téléphone (Optionnel)" name="numeroTelephone" value={numeroTelephone} onChange={(e) => setNumeroTelephone(e.target.value)} />
                    <Input label="Mot de passe" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Input label="Confirmer le mot de passe" type="password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    <Button type="submit" variant="primary" className="w-full" disabled={loading} Icon={loading ? null : UserPlus}>
                        {loading ? <LoadingSpinner size="sm" /> : 'S\'inscrire'}
                    </Button>
                </form>
                <p className="text-sm text-center mt-4">
                    Déjà un compte ?{' '}
                    <button onClick={() => navigateTo('login')} className="font-medium text-green-600 hover:text-green-500">
                        Connectez-vous
                    </button>
                </p>
            </Card>
        </div>
    );
};

// Page Tableau de Bord (exemple de page protégée)
const DashboardPage = ({ navigateTo }) => {
    const { user } = useAuth();
    return (
        <Card>
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Tableau de Bord</h1>
            <p className="text-gray-600">Bienvenue, {user?.nom_complet || user?.email} !</p>
            <p className="text-gray-600 mt-2">C'est ici que vous trouverez un aperçu de votre exploitation.</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Button onClick={() => navigateTo('parcelles')} Icon={MapPinned} className="w-full justify-start p-6 text-left bg-green-50 hover:bg-green-100 text-green-700">
                    <div className="ml-2">
                        <p className="font-semibold">Mes Parcelles</p>
                        <p className="text-xs">Gérer vos terrains agricoles</p>
                    </div>
                </Button>
                 <Button onClick={() => navigateTo('meteo')} Icon={Sun} className="w-full justify-start p-6 text-left bg-blue-50 hover:bg-blue-100 text-blue-700">
                    <div className="ml-2">
                        <p className="font-semibold">Météo Agricole</p>
                        <p className="text-xs">Consulter les prévisions</p>
                    </div>
                </Button>
                <Button onClick={() => navigateTo('prix')} Icon={ShoppingCart} className="w-full justify-start p-6 text-left bg-yellow-50 hover:bg-yellow-100 text-yellow-700">
                    <div className="ml-2">
                        <p className="font-semibold">Bourse des Prix</p>
                        <p className="text-xs">Suivre les cours du marché</p>
                    </div>
                </Button>
            </div>
        </Card>
    );
};

// Service Parcelles
const parcelleService = {
    getUserParcelles: async (page = 1, limit = 10) => {
        return apiService.get(`/parcelles/user?page=${page}&limit=${limit}`);
    },
    getParcelleById: async (id) => {
        return apiService.get(`/parcelles/${id}`);
    },
    createParcelle: async (parcelleData) => {
        return apiService.post('/parcelles', parcelleData);
    },
    updateParcelle: async (id, parcelleData) => {
        return apiService.put(`/parcelles/${id}`, parcelleData);
    },
    deleteParcelle: async (id) => {
        return apiService.delete(`/parcelles/${id}`);
    },
};

// Page Liste des Parcelles
const ParcellesListPage = ({ navigateTo }) => {
    const [parcelles, setParcelles] = useState([]);
    const [loading, setLoadingState] = useState(true); // Renommé
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { logout } = useAuth(); 

    const fetchParcelles = useCallback(async (page) => {
        setLoadingState(true);
        setError('');
        try {
            const data = await parcelleService.getUserParcelles(page);
            setParcelles(data.data);
            setPagination(data.pagination);
        } catch (err) {
            setError(err.message || "Erreur lors de la récupération des parcelles.");
            if (err.message.includes("401") || err.message.includes("Accès non autorisé")) {
                logout();
                navigateTo('login');
            }
        } finally {
            setLoadingState(false);
        }
    }, [logout, navigateTo]);

    useEffect(() => {
        fetchParcelles(currentPage);
    }, [fetchParcelles, currentPage]);

    const handleDelete = async (id) => {
        // Remplacer window.confirm par un Modal personnalisé pour éviter les problèmes dans les iframes
        // Pour cet exemple, on garde window.confirm mais il faudrait le changer.
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette parcelle ?")) {
            try {
                await parcelleService.deleteParcelle(id);
                setParcelles(parcelles.filter(p => p.id !== id));
                if (parcelles.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchParcelles(currentPage);
                }
            } catch (err) {
                setError(err.message || "Erreur lors de la suppression de la parcelle.");
            }
        }
    };
    
    const handlePageChange = (newPage) => {
        if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (loading) return <div className="flex justify-center mt-10"><LoadingSpinner size="lg" /></div>;
    
    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Mes Parcelles</h1>
                <Button onClick={() => navigateTo('addParcelle')} variant="primary" Icon={PlusCircle}>
                    Ajouter une Parcelle
                </Button>
            </div>
            {error && <Alert message={error} type="error" onClose={() => setError('')} />}
            
            {parcelles.length === 0 && !loading && (
                <p className="text-gray-600 text-center py-10">Vous n'avez pas encore de parcelles enregistrées.</p>
            )}

            {parcelles.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Superficie (ha)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de Sol</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {parcelles.map((parcelle) => (
                                <tr key={parcelle.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{parcelle.nom_parcelle}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parcelle.superficie_calculee_ha || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parcelle.type_sol_predominant || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Button onClick={() => navigateTo(`parcelleDetail/${parcelle.id}`)} variant="ghost" Icon={Eye} className="text-blue-600 hover:text-blue-800 p-1"><span className="sr-only">Voir</span></Button>
                                        <Button onClick={() => navigateTo(`editParcelle/${parcelle.id}`)} variant="ghost" Icon={Edit3} className="text-yellow-600 hover:text-yellow-800 p-1"><span className="sr-only">Modifier</span></Button>
                                        <Button onClick={() => handleDelete(parcelle.id)} variant="ghost" Icon={Trash2} className="text-red-600 hover:text-red-800 p-1"><span className="sr-only">Supprimer</span></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center space-x-2">
                    <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Précédent</Button>
                    <span className="text-sm text-gray-700">Page {currentPage} sur {pagination.totalPages}</span>
                    <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages}>Suivant</Button>
                </div>
            )}
        </Card>
    );
};

// Page Ajouter/Modifier une Parcelle (Formulaire)
const ParcelleFormPage = ({ navigateTo, parcelleId }) => {
    const [nomParcelle, setNomParcelle] = useState('');
    const [description, setDescription] = useState('');
    const [superficie, setSuperficie] = useState('');
    const [typeSol, setTypeSol] = useState('');
    const [geometrie, setGeometrie] = useState(''); 
    const [cultureActuelleId, setCultureActuelleId] = useState('');
    const [culturesCatalogue, setCulturesCatalogue] = useState([]);

    const [loading, setLoadingState] = useState(false); // Renommé
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const { logout } = useAuth();

    const isEditing = !!parcelleId;

    useEffect(() => {
        const fetchCultures = async () => {
            try {
                const data = await apiService.get('/cultures'); 
                setCulturesCatalogue(data.data || data); 
            } catch (err) {
                console.error("Erreur chargement catalogue cultures:", err);
            }
        };
        fetchCultures();

        if (isEditing) {
            setLoadingState(true);
            parcelleService.getParcelleById(parcelleId)
                .then(data => {
                    setNomParcelle(data.nom_parcelle);
                    setDescription(data.description || '');
                    setSuperficie(data.superficie_calculee_ha || '');
                    setTypeSol(data.type_sol_predominant || '');
                    setGeometrie(data.geometrie ? JSON.stringify(data.geometrie) : ''); 
                    setCultureActuelleId(data.culture_actuelle_id || '');
                    setLoadingState(false);
                })
                .catch(err => {
                    setFormError(err.message || "Erreur chargement de la parcelle.");
                    if (err.message.includes("401")) { logout(); navigateTo('login'); }
                    setLoadingState(false);
                });
        }
    }, [parcelleId, isEditing, logout, navigateTo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setLoadingState(true);

        let parsedGeometrie;
        try {
            if (geometrie) parsedGeometrie = JSON.parse(geometrie);
        } catch (err) {
            setFormError("Format GeoJSON de la géométrie invalide.");
            setLoadingState(false);
            return;
        }

        const parcelleData = {
            nom_parcelle: nomParcelle,
            description,
            superficie_calculee_ha: superficie ? parseFloat(superficie) : null,
            type_sol_predominant: typeSol,
            geometrie: parsedGeometrie, 
            culture_actuelle_id: cultureActuelleId ? parseInt(cultureActuelleId) : null,
        };

        try {
            if (isEditing) {
                await parcelleService.updateParcelle(parcelleId, parcelleData);
                setFormSuccess("Parcelle mise à jour avec succès !");
            } else {
                await parcelleService.createParcelle(parcelleData);
                setFormSuccess("Parcelle créée avec succès !");
                setNomParcelle(''); setDescription(''); setSuperficie(''); setTypeSol(''); setGeometrie(''); setCultureActuelleId('');
            }
            setTimeout(() => navigateTo('parcelles'), 1500);
        } catch (err) {
            setFormError(err.message || "Erreur lors de l'enregistrement de la parcelle.");
            if (err.message.includes("401")) { logout(); navigateTo('login'); }
        } finally {
            setLoadingState(false);
        }
    };

    if (loading && isEditing && !nomParcelle) return <div className="flex justify-center mt-10"><LoadingSpinner size="lg" /></div>;

    return (
        <Card>
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                {isEditing ? "Modifier la Parcelle" : "Ajouter une Nouvelle Parcelle"}
            </h1>
            {formError && <Alert message={formError} type="error" onClose={() => setFormError('')} />}
            {formSuccess && <Alert message={formSuccess} type="success" onClose={() => setFormSuccess('')} />}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input label="Nom de la parcelle" name="nomParcelle" value={nomParcelle} onChange={(e) => setNomParcelle(e.target.value)} required error={!nomParcelle && formError ? "Nom requis" : ""} />
                
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    ></textarea>
                </div>

                <Input label="Superficie (ha)" type="number" name="superficie" value={superficie} onChange={(e) => setSuperficie(e.target.value)} />
                <Input label="Type de sol prédominant" name="typeSol" value={typeSol} onChange={(e) => setTypeSol(e.target.value)} />
                
                <div>
                    <label htmlFor="geometrie" className="block text-sm font-medium text-gray-700 mb-1">Géométrie (GeoJSON)</label>
                    <textarea
                        id="geometrie"
                        name="geometrie"
                        rows="5"
                        value={geometrie}
                        onChange={(e) => setGeometrie(e.target.value)}
                        placeholder='Ex: {"type":"Polygon","coordinates":[[[10.0,36.0],[10.1,36.0],[10.1,36.1],[10.0,36.1],[10.0,36.0]]]}'
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm font-mono text-xs"
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500">Collez ici la chaîne GeoJSON de votre polygone. Un outil de dessin sur carte sera intégré ultérieurement.</p>
                </div>

                <div>
                    <label htmlFor="cultureActuelleId" className="block text-sm font-medium text-gray-700 mb-1">Culture Actuelle (Optionnel)</label>
                    <select
                        id="cultureActuelleId"
                        name="cultureActuelleId"
                        value={cultureActuelleId}
                        onChange={(e) => setCultureActuelleId(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                    >
                        <option value="">-- Sélectionner une culture --</option>
                        {culturesCatalogue.map(culture => (
                            <option key={culture.id} value={culture.id}>{culture.nom_culture}</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end space-x-3">
                    <Button type="button" variant="secondary" onClick={() => navigateTo('parcelles')} disabled={loading}>
                        Annuler
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading} Icon={loading ? null : (isEditing ? Edit3 : PlusCircle)}>
                        {loading ? <LoadingSpinner size="sm" /> : (isEditing ? "Mettre à jour" : "Créer Parcelle")}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

// Page de Détail d'une Parcelle (Squelette)
const ParcelleDetailPage = ({ navigateTo, parcelleId }) => {
    const [parcelle, setParcelle] = useState(null);
    const [loading, setLoadingState] = useState(true); // Renommé
    const [error, setError] = useState('');
    const { logout } = useAuth();

    useEffect(() => {
        if (parcelleId) {
            setLoadingState(true);
            parcelleService.getParcelleById(parcelleId)
                .then(data => {
                    setParcelle(data);
                    setLoadingState(false);
                })
                .catch(err => {
                    setError(err.message || "Erreur chargement détails de la parcelle.");
                     if (err.message.includes("401")) { logout(); navigateTo('login'); }
                    setLoadingState(false);
                });
        }
    }, [parcelleId, logout, navigateTo]);

    if (loading) return <div className="flex justify-center mt-10"><LoadingSpinner size="lg" /></div>;
    if (error) return <Alert message={error} type="error" />;
    if (!parcelle) return <Alert message="Parcelle non trouvée." type="warning" />;

    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{parcelle.nom_parcelle}</h1>
                    <p className="text-gray-600 mb-4">{parcelle.description || "Aucune description."}</p>
                </div>
                <Button onClick={() => navigateTo(`editParcelle/${parcelle.id}`)} variant="secondary" Icon={Edit3}>Modifier</Button>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700">Informations Générales</h3>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        <li><strong>Superficie:</strong> {parcelle.superficie_calculee_ha || 'N/A'} ha</li>
                        <li><strong>Type de sol:</strong> {parcelle.type_sol_predominant || 'N/A'}</li>
                        <li><strong>Date de création:</strong> {new Date(parcelle.date_creation).toLocaleDateString()}</li>
                        {/* Ajouter culture actuelle si disponible */}
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-700">Géométrie (GeoJSON)</h3>
                    <pre className="mt-2 bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
                        {JSON.stringify(parcelle.geometrie, null, 2) || "Non définie"}
                    </pre>
                    {/* Ici, on afficherait une carte avec la géométrie */}
                </div>
            </div>
             <div className="mt-8">
                <Button onClick={() => navigateTo('parcelles')} variant="ghost">Retour à la liste des parcelles</Button>
            </div>
        </Card>
    );
};


// Placeholder pour les autres pages
const CulturesCataloguePage = () => <Card><h1 className="text-xl font-semibold">Catalogue des Cultures (À implémenter)</h1></Card>;
const ElevagePage = () => <Card><h1 className="text-xl font-semibold">Gestion de l'Élevage (À implémenter)</h1></Card>;
const PrixPage = () => <Card><h1 className="text-xl font-semibold">Bourse des Prix (À implémenter)</h1></Card>;
const MeteoPage = () => <Card><h1 className="text-xl font-semibold">Météo Agricole (À implémenter)</h1></Card>;
const CommunautePage = () => <Card><h1 className="text-xl font-semibold">Communauté & Forum (À implémenter)</h1></Card>;
const GeminiPage = () => <Card><h1 className="text-xl font-semibold">Conseils IA Gemini (À implémenter)</h1></Card>;
const NotFoundPage = () => (
    <Card className="text-center">
        <AlertTriangle size={64} className="mx-auto text-yellow-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">404 - Page Non Trouvée</h1>
        <p className="text-gray-600 mt-2">Désolé, la page que vous recherchez n'existe pas.</p>
    </Card>
);


// Composant principal de l'application
function App() {
    const [currentPage, setCurrentPage] = useState('home'); 
    const [pageParam, setPageParam] = useState(null); 
    const { isAuthenticated, loading: authLoading } = useAuth();

    const navigateTo = (page, param = null) => {
        setCurrentPage(page);
        setPageParam(param);
        window.scrollTo(0, 0); 
    };

    useEffect(() => {
        if (!authLoading) {
            if (isAuthenticated) {
                if (currentPage === 'login' || currentPage === 'register') {
                    navigateTo('dashboard'); 
                }
            } else {
                const protectedPages = ['dashboard', 'parcelles', 'addParcelle', 'editParcelle', 'parcelleDetail', 'elevage', 'meteo', 'communaute', 'gemini'];
                if (protectedPages.includes(currentPage)) {
                    navigateTo('login');
                }
            }
        }
    }, [isAuthenticated, authLoading, currentPage]); // Removed navigateTo from dependencies


    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    let pageComponent;
    switch (currentPage) {
        case 'home':
            pageComponent = <HomePage navigateTo={navigateTo} />;
            break;
        case 'login':
            pageComponent = <LoginPage navigateTo={navigateTo} />;
            break;
        case 'register':
            pageComponent = <RegisterPage navigateTo={navigateTo} />;
            break;
        case 'dashboard':
            pageComponent = isAuthenticated ? <DashboardPage navigateTo={navigateTo} /> : <LoginPage navigateTo={navigateTo} />;
            break;
        case 'parcelles':
            pageComponent = isAuthenticated ? <ParcellesListPage navigateTo={navigateTo} /> : <LoginPage navigateTo={navigateTo} />;
            break;
        case 'addParcelle':
            pageComponent = isAuthenticated ? <ParcelleFormPage navigateTo={navigateTo} /> : <LoginPage navigateTo={navigateTo} />;
            break;
        case 'editParcelle': 
            pageComponent = isAuthenticated ? <ParcelleFormPage navigateTo={navigateTo} parcelleId={pageParam} /> : <LoginPage navigateTo={navigateTo} />;
            break;
        case 'parcelleDetail': 
            pageComponent = isAuthenticated ? <ParcelleDetailPage navigateTo={navigateTo} parcelleId={pageParam} /> : <LoginPage navigateTo={navigateTo} />;
            break;
        case 'cultures':
            pageComponent = <CulturesCataloguePage />;
            break;
        case 'elevage':
            pageComponent = isAuthenticated ? <ElevagePage /> : <LoginPage navigateTo={navigateTo} />;
            break;
        case 'prix':
            pageComponent = <PrixPage />;
            break;
        case 'meteo':
            pageComponent = isAuthenticated ? <MeteoPage /> : <LoginPage navigateTo={navigateTo} />;
            break;
        case 'communaute':
            pageComponent = isAuthenticated ? <CommunautePage /> : <LoginPage navigateTo={navigateTo} />;
            break;
        case 'gemini':
            pageComponent = isAuthenticated ? <GeminiPage /> : <LoginPage navigateTo={navigateTo} />;
            break;
        default:
            pageComponent = <NotFoundPage />;
    }

    return (
        <MainLayout navigateTo={navigateTo}>
            {pageComponent}
        </MainLayout>
    );
}

const AgriApp = () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);

export default AgriApp;

