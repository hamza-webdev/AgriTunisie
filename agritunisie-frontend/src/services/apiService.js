// src/services/apiService.js
const getApiBaseUrlFromApiService = () => { // Renommé
    try {
        if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
            return process.env.REACT_APP_API_URL;
        }
    } catch (e) {
        console.warn("ApiService: Impossible d'accéder à process.env.REACT_APP_API_URL, utilisation de l'URL par défaut.", e);
    }
    return 'http://localhost:3001/api';
};
const API_BASE_URL_SERVICE = getApiBaseUrlFromApiService();

export const apiService = {
    get: async (endpoint) => {
        const token = localStorage.getItem('agritunisie_token');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) {
            if (response.status === 401) console.warn("API call 401 (apiService)");
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Erreur API GET: ${response.status}`);
        }
        return response.json();
    },
    post: async (endpoint, data) => {
        const token = localStorage.getItem('agritunisie_token');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Erreur API POST: ${response.status}`);
        }
        return response.json();
    },
    put: async (endpoint, data) => {
        const token = localStorage.getItem('agritunisie_token');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Erreur API PUT: ${response.status}`);
        }
        return response.json();
    },
    delete: async (endpoint) => {
        const token = localStorage.getItem('agritunisie_token');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Erreur API DELETE: ${response.status}`);
        }
        return response.json();
    },
};
