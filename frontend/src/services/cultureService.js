// frontend/src/services/cultureService.js
import { apiService } from './apiService';

/**
 * Récupère toutes les cultures du catalogue avec pagination.
 * @param {number} page - Le numéro de la page à récupérer.
 * @param {number} limit - Le nombre d'éléments par page.
 * @returns {Promise<object>} - Un objet contenant les données et les informations de pagination.
 */
export const getAllCultures = async (page = 1, limit = 10) => {
    // Note: Backend supports pagination via query params page & limit
    return apiService.get(`/cultures?page=${page}&limit=${limit}`);
};

/**
 * Récupère une culture spécifique par son ID.
 * @param {string|number} id - L'ID de la culture.
 * @returns {Promise<object|null>} - L'objet de la culture ou null si non trouvé.
 */
export const getCultureById = async (id) => {
    return apiService.get(`/cultures/${id}`);
};

/**
 * Crée une nouvelle culture.
 * IMPORTANT: La route backend correspondante (POST /cultures) est actuellement commentée
 * et nécessite une activation (et potentiellement des droits admin) pour fonctionner.
 * @param {object} cultureData - Les données de la culture à créer.
 * @returns {Promise<object>} - L'objet de la culture créée.
 */
export const createCulture = async (cultureData) => {
    console.warn("Tentative de création de culture : la route backend POST /cultures n'est peut-être pas active.");
    return apiService.post('/cultures', cultureData);
};

/**
 * Met à jour une culture existante.
 * IMPORTANT: La route backend correspondante (PUT /cultures/:id) est actuellement commentée
 * et nécessite une activation (et potentiellement des droits admin) pour fonctionner.
 * @param {string|number} id - L'ID de la culture à mettre à jour.
 * @param {object} cultureData - Les nouvelles données de la culture.
 * @returns {Promise<object>} - L'objet de la culture mise à jour.
 */
export const updateCulture = async (id, cultureData) => {
    console.warn(`Tentative de mise à jour de la culture ${id} : la route backend PUT /cultures/:id n'est peut-être pas active.`);
    return apiService.put(`/cultures/${id}`, cultureData);
};

/**
 * Supprime une culture.
 * IMPORTANT: La route backend correspondante (DELETE /cultures/:id) est actuellement commentée
 * et nécessite une activation (et potentiellement des droits admin) pour fonctionner.
 * @param {string|number} id - L'ID de la culture à supprimer.
 * @returns {Promise<object>} - La réponse de l'API (généralement un message de succès).
 */
export const deleteCulture = async (id) => {
    console.warn(`Tentative de suppression de la culture ${id} : la route backend DELETE /cultures/:id n'est peut-être pas active.`);
    return apiService.delete(`/cultures/${id}`);
};
