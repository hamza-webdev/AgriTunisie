// src/contexts/AuthContext.js
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'; // Déjà importé en haut
const getApiBaseUrlFromContext = () => { // Renommé pour éviter conflit
    try {
        if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
            return process.env.REACT_APP_API_URL;
        }
    } catch (e) {
        console.warn("AuthContext: Impossible d'accéder à process.env.REACT_APP_API_URL, utilisation de l'URL par défaut.", e);
    }
    return 'http://localhost:3001/api';
};
const API_BASE_URL_CONTEXT = getApiBaseUrlFromContext();

const AuthContextInstance = createContext(null); // Renommé pour éviter conflit

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('agritunisie_token'));
    const [loadingAuth, setLoadingAuth] = useState(true); // Renommé pour clarté

    const logout = useCallback(() => {
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
                console.error("Erreur AuthContext: récupération utilisateur localStorage", error);
                logout();
            }
        }
        setLoadingAuth(false);
    }, [token, logout]);

    const login = async (email, password) => {
        setLoadingAuth(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Échec de la connexion');
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('agritunisie_token', data.token);
            localStorage.setItem('agritunisie_user', JSON.stringify(data.user));
            setLoadingAuth(false);
            return data;
        } catch (error) {
            console.error("Erreur de connexion (AuthContext):", error);
            setLoadingAuth(false);
            throw error;
        }
    };

    const register = async (userData) => {
        setLoadingAuth(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Échec de l\'inscription');
            setLoadingAuth(false);
            return data;
        } catch (error) {
            console.error("Erreur d'inscription (AuthContext):", error);
            setLoadingAuth(false);
            throw error;
        }
    };

    return (
        <AuthContextInstance.Provider value={{ user, token, login, register, logout, loading: loadingAuth, isAuthenticated: !!token }}>
            {children}
        </AuthContextInstance.Provider>
    );
};

export const useAuth = () => useContext(AuthContextInstance);