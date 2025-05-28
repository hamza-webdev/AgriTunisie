// src/AppRouter.js (Anciennement le composant App, gère la logique de navigation)
import React, { useState, useEffect, useContext } from 'react'; // Retiré useCallback car navigateTo n'est plus dans les deps
import { AuthContext, useAuth } from './contexts/AuthContext'; // Assurez-vous que le chemin est correct
import React, { useState, useEffect, useContext, useCallback } from 'react';

// Importer les layouts et les pages
import MainLayout from './components/layout/MainLayout'; // Chemin exemple
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ParcellesListPage from './pages/parcelles/ParcellesListPage';
import ParcelleFormPage from './pages/parcelles/ParcelleFormPage';
import ParcelleDetailPage from './pages/parcelles/ParcelleDetailPage';
import CulturesCataloguePage from './pages/cultures/CulturesCataloguePage';
import ElevagePage from './pages/elevage/ElevagePage';
import PrixPage from './pages/prix/PrixPage';
import MeteoPage from './pages/meteo/MeteoPage';
import CommunautePage from './pages/communaute/CommunautePage';
import GeminiPage from './pages/gemini/GeminiPage';
import NotFoundPage from './pages/NotFoundPage';
import { LoadingSpinner } from './components/common/LoadingSpinner'; // Chemin exemple
import { Shield, LogIn, UserPlus, MapPinned, PlusCircle, Home, LogOut, Sun, Moon, Leaf, Tractor, ShoppingCart, MessageSquare, BarChart3, AlertTriangle, Settings, ChevronDown, Search, Filter, Edit3, Trash2, Info, Eye, EyeOff, UploadCloud, CheckCircle, XCircle, CalendarDays, Users, DollarSign, Brain, Menu, X } from 'lucide-react';


function AppRouterInternal() {
    const [currentPage, setCurrentPage] = useState('home');
    const [pageParam, setPageParam] = useState(null);
    const { isAuthenticated, loading: authLoading } = useAuth(); // Utilise useAuth ici

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
    }, [isAuthenticated, authLoading, currentPage]); // navigateTo a été retiré des dépendances

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    let pageComponent;
    switch (currentPage) {
        case 'home': pageComponent = <HomePage navigateTo={navigateTo} />; break;
        case 'login': pageComponent = <LoginPage navigateTo={navigateTo} />; break;
        case 'register': pageComponent = <RegisterPage navigateTo={navigateTo} />; break;
        case 'dashboard': pageComponent = isAuthenticated ? <DashboardPage navigateTo={navigateTo} /> : <LoginPage navigateTo={navigateTo} />; break;
        case 'parcelles': pageComponent = isAuthenticated ? <ParcellesListPage navigateTo={navigateTo} /> : <LoginPage navigateTo={navigateTo} />; break;
        case 'addParcelle': pageComponent = isAuthenticated ? <ParcelleFormPage navigateTo={navigateTo} /> : <LoginPage navigateTo={navigateTo} />; break;
        case 'editParcelle': pageComponent = isAuthenticated ? <ParcelleFormPage navigateTo={navigateTo} parcelleId={pageParam} /> : <LoginPage navigateTo={navigateTo} />; break;
        case 'parcelleDetail': pageComponent = isAuthenticated ? <ParcelleDetailPage navigateTo={navigateTo} parcelleId={pageParam} /> : <LoginPage navigateTo={navigateTo} />; break;
        case 'cultures': pageComponent = <CulturesCataloguePage navigateTo={navigateTo} />; break;
        case 'elevage': pageComponent = isAuthenticated ? <ElevagePage navigateTo={navigateTo} /> : <LoginPage navigateTo={navigateTo} />; break;
        case 'prix': pageComponent = <PrixPage navigateTo={navigateTo} />; break;
        case 'meteo': pageComponent = isAuthenticated ? <MeteoPage navigateTo={navigateTo} /> : <LoginPage navigateTo={navigateTo} />; break;
        case 'communaute': pageComponent = isAuthenticated ? <CommunautePage navigateTo={navigateTo} /> : <LoginPage navigateTo={navigateTo} />; break;
        case 'gemini': pageComponent = isAuthenticated ? <GeminiPage navigateTo={navigateTo} /> : <LoginPage navigateTo={navigateTo} />; break;
        default: pageComponent = <NotFoundPage />;
    }

    return (
        <MainLayout navigateTo={navigateTo}>
            {pageComponent}
        </MainLayout>
    );
}
export default AppRouterInternal; // Exporter si utilisé dans AgriApp.js