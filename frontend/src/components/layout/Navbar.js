// src/components/layout/Navbar.js
import React, { useState } from 'react'; // Déjà importé
import { useAuth } from '../../contexts/AuthContext'; // Adapter le chemin
import { Button } from '../common/Button'; // Adapter le chemin
import { Shield, LogIn, UserPlus, Home, LogOut, MapPinned, Leaf, Tractor, ShoppingCart, Sun, MessageSquare, Brain, Menu, X } from 'lucide-react';

export const Navbar = ({ navigateTo }) => { // Exporter directement
    const { user, logout, isAuthenticated } = useAuth(); // Utilise useAuth
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // ... (code du composant Navbar comme avant, s'assurer que useAuth est importé correctement si AuthContext est séparé)
    const handleLogout = () => { logout(); navigateTo('login'); };
    const navItems = [
        { name: 'Accueil', page: 'home', icon: Home, authRequired: false },
        { name: 'Mes Parcelles', page: 'parcelles', icon: MapPinned, authRequired: true },
        { name: 'Catalogue Cultures', page: 'cultures', icon: Leaf, authRequired: false },
        { name: 'Élevage', page: 'elevage', icon: Tractor, authRequired: true },
        { name: 'Bourse des Prix', page: 'prix', icon: ShoppingCart, authRequired: false },
        { name: 'Météo', page: 'meteo', icon: Sun},
        { name: 'LocaliseMe', page: 'localiseme', icon: MapPinned},
        { name: 'Communauté', page: 'communaute', icon: MessageSquare, authRequired: true },
        { name: 'Conseils IA', page: 'gemini', icon: Brain, authRequired: true },
    ];
    return (
        <nav className="bg-white shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Shield className="h-8 w-8 text-green-600" />
                        <span className="font-bold text-xl text-green-700 ml-2 cursor-pointer" onClick={() => navigateTo('home')}>AgriTunisie</span>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navItems.filter(item => !item.authRequired || isAuthenticated).map((item) => (
                                <button key={item.name} onClick={() => navigateTo(item.page)} className="text-gray-600 hover:bg-green-50 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium flex items-center">
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
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} type="button" className="bg-green-50 inline-flex items-center justify-center p-2 rounded-md text-green-600 hover:text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500" aria-controls="mobile-menu" aria-expanded="false">
                            <span className="sr-only">Ouvrir le menu principal</span>
                            {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>
            {isMobileMenuOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navItems.filter(item => !item.authRequired || isAuthenticated).map((item) => (
                             <button key={item.name} onClick={() => { navigateTo(item.page); setIsMobileMenuOpen(false); }} className="text-gray-600 hover:bg-green-50 hover:text-green-700 block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center">
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
// ... (Footer, MainLayout comme avant, à mettre dans leurs propres fichiers)
