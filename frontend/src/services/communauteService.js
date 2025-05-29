// frontend/src/services/communauteService.js
import { apiService } from './apiService'; // Assuming apiService.js is in the same directory

/**
 * Récupère les catégories du forum avec pagination.
 * @param {object} params - Options de pagination { page, limit }.
 * @returns {Promise<object>} - Un objet contenant les données et les informations de pagination.
 */
export const getCategories = async ({ page = 1, limit = 20 } = {}) => {
    return apiService.get(`/communaute/categories?page=${page}&limit=${limit}`);
};

/**
 * Récupère les posts d'une catégorie spécifique avec pagination.
 * @param {string|number} categorieId - L'ID de la catégorie.
 * @param {object} params - Options de pagination { page, limit }.
 * @returns {Promise<object>} - Un objet contenant les données et les informations de pagination.
 */
export const getPostsByCategorie = async (categorieId, { page = 1, limit = 10 } = {}) => {
    if (!categorieId) throw new Error("L'ID de la catégorie est requis.");
    return apiService.get(`/communaute/posts/categorie/${categorieId}?page=${page}&limit=${limit}`);
};

/**
 * Récupère les détails d'un post spécifique.
 * @param {string|number} postId - L'ID du post.
 * @returns {Promise<object|null>} - L'objet du post ou null si non trouvé.
 */
export const getPostDetails = async (postId) => {
    if (!postId) throw new Error("L'ID du post est requis.");
    return apiService.get(`/communaute/posts/${postId}`);
};

/**
 * Récupère les commentaires d'un post spécifique avec pagination.
 * @param {string|number} postId - L'ID du post.
 * @param {object} params - Options de pagination { page, limit }.
 * @returns {Promise<object>} - Un objet contenant les données et les informations de pagination.
 */
export const getCommentsForPost = async (postId, { page = 1, limit = 10 } = {}) => {
    if (!postId) throw new Error("L'ID du post est requis pour récupérer les commentaires.");
    return apiService.get(`/communaute/posts/${postId}/commentaires?page=${page}&limit=${limit}`);
};

/**
 * Crée un nouveau post. Nécessite une authentification.
 * @param {object} postData - Les données du post à créer.
 *  Doit contenir: { categorie_id, titre_post, contenu_post }
 * @returns {Promise<object>} - L'objet du post créé.
 */
export const createPost = async (postData) => {
    const { categorie_id, titre_post, contenu_post } = postData;
    if (!categorie_id || !titre_post || !contenu_post) {
        throw new Error("L'ID de la catégorie, le titre et le contenu du post sont requis.");
    }
    // Note: apiService.post already includes Authorization header if token exists
    return apiService.post('/communaute/posts', postData);
};

/**
 * Ajoute un commentaire à un post spécifique. Nécessite une authentification.
 * @param {string|number} postId - L'ID du post auquel ajouter le commentaire.
 * @param {object} commentData - Les données du commentaire.
 *  Doit contenir: { contenu_commentaire }
 * @returns {Promise<object>} - L'objet du commentaire créé.
 */
export const addCommentToPost = async (postId, commentData) => {
    if (!postId) throw new Error("L'ID du post est requis pour ajouter un commentaire.");
    const { contenu_commentaire } = commentData;
    if (!contenu_commentaire) {
        throw new Error("Le contenu du commentaire est requis.");
    }
    // Note: apiService.post already includes Authorization header if token exists
    return apiService.post(`/communaute/posts/${postId}/commentaires`, commentData);
};
