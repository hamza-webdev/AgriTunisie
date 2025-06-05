// src/AppRouter.js (Anciennement le composant App, gère la logique de navigation)// Retiré useCallback car navigateTo n'est plus dans les deps
import { useAuth } from './contexts/AuthContext'; // Assurez-vous que le chemin est correct
import React, { useState, useEffect, useCallback } from 'react';

// Importer les layouts et les pages
import MainLayout from './components/layout/MainLayout'; // Chemin exemple
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ParcellesListPage from './pages/parcelles/ParcellesListPage';
import ParcelleFormPage from './pages/parcelles/ParcelleFormPage';
import ParcelleDetailPage from './pages/parcelles/ParcelleDetailPage';
// import CulturesCataloguePage from './pages/cultures/CulturesCataloguePage'; // Old page
import CulturesListPage from './pages/cultures/CulturesListPage'; // Will replace CulturesCataloguePage
import CultureDetailPage from './pages/cultures/CultureDetailPage'; // To be created
import CultureFormPage from './pages/cultures/CultureFormPage';   // To be created
import ElevagePage from './pages/elevage/ElevagePage';
import PrixPage from './pages/prix/PrixPage';
import MeteoPage from './pages/meteo/MeteoPage';
// import CommunautePage from './pages/communaute/CommunautePage'; // Old page
import CategoriesListPage from './pages/communaute/CategoriesListPage'; // To be created
import PostsListPage from './pages/communaute/PostsListPage';       // To be created
import PostDetailPage from './pages/communaute/PostDetailPage';     // To be created
import CreatePostPage from './pages/communaute/CreatePostPage';     // To be created
import GeminiPage from './pages/gemini/GeminiPage';
import NotFoundPage from './pages/NotFoundPage';
import { LoadingSpinner } from './components/common/LoadingSpinner'; // Chemin exemple


function AppRouterInternal() {
    const [currentPage, setCurrentPage] = useState('home');
    const [pageParam, setPageParam] = useState(null);
    const { isAuthenticated, loading: authLoading } = useAuth(); // Utilise useAuth ici



    const navigateTo = useCallback((page, param = null) => {
        setCurrentPage(page);
        setPageParam(param);
        window.scrollTo(0, 0);
    }, []); // setCurrentPage and setPageParam are stable and don't need to be listed as dependencies

    useEffect(() => {
        if (!authLoading) {
            if (isAuthenticated) {
                if (currentPage === 'login' || currentPage === 'register') {
                    navigateTo('dashboard');
                }
            } else {
                const protectedPages = ['dashboard', 'parcelles', 'addParcelle', 'editParcelle', 'parcelleDetail', 'elevage', 'meteo', /* 'communaute', */ 'gemini', 'culturesList', 'cultureDetail', 'addCulture', 'editCulture', 'communauteCreatePost'];
                if (protectedPages.includes(currentPage)) {
                    navigateTo('login');
                }
            }
        }
    }, [isAuthenticated, authLoading, currentPage, navigateTo]);

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
        // case 'cultures': pageComponent = <CulturesCataloguePage navigateTo={navigateTo} />; break; // Old route
        case 'culturesList':
            pageComponent = isAuthenticated ? <CulturesListPage navigateTo={navigateTo} /> : <LoginPage navigateTo={navigateTo} />;
            break;
        case 'cultureDetail':
            pageComponent = isAuthenticated ? <CultureDetailPage navigateTo={navigateTo} cultureId={pageParam} /> : <LoginPage navigateTo={navigateTo} />;
            break;
        case 'addCulture':
            pageComponent = isAuthenticated ? <CultureFormPage navigateTo={navigateTo} /> : <LoginPage navigateTo={navigateTo} />;
            break;
        case 'editCulture':
            pageComponent = isAuthenticated ? <CultureFormPage navigateTo={navigateTo} cultureId={pageParam} /> : <LoginPage navigateTo={navigateTo} />;
            break;
        case 'elevage': pageComponent = isAuthenticated ? <ElevagePage navigateTo={navigateTo} /> : <LoginPage navigateTo={navigateTo} />; break;
        case 'prix': pageComponent = <PrixPage navigateTo={navigateTo} />; break;
        case 'meteo': pageComponent = isAuthenticated ? <MeteoPage navigateTo={navigateTo} /> : <LoginPage navigateTo={navigateTo} />; break;
        // case 'communaute': pageComponent = isAuthenticated ? <CommunautePage navigateTo={navigateTo} /> : <LoginPage navigateTo={navigateTo} />; break; // Old route
        case 'communauteCategories':
            pageComponent = <CategoriesListPage navigateTo={navigateTo} />;
            break;
        case 'communautePostsList':
            pageComponent = <PostsListPage navigateTo={navigateTo} categorieId={pageParam?.categorieId} />;
            break;
        case 'communautePostDetail':
            pageComponent = <PostDetailPage navigateTo={navigateTo} postId={pageParam?.postId} />;
            break;
        case 'communauteCreatePost':
            pageComponent = isAuthenticated ? <CreatePostPage navigateTo={navigateTo} categorieId={pageParam?.categorieId} /> : <LoginPage navigateTo={navigateTo} />;
            break;
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