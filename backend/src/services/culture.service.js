// backend/src/services/culture.service.js
const db = require('../config/db.config');

class CultureService {
    /**
     * Récupère toutes les cultures du catalogue avec pagination.
     * @param {object} paginationOptions - Options de pagination { page, limit }.
     * @returns {Promise<object>} - Un objet contenant les données et les informations de pagination.
     */
    async getAll({ page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;

        const dataQuery = `
            SELECT id, nom_culture, description_generale, periode_semis_ideale_debut, 
                   periode_semis_ideale_fin, besoins_eau_mm_cycle, type_sol_recommande
            FROM cultures_catalogue
            ORDER BY nom_culture
            LIMIT $1 OFFSET $2;
        `;
        const countQuery = 'SELECT COUNT(*) FROM cultures_catalogue;';

        try {
            const [dataResult, countResult] = await Promise.all([
                db.query(dataQuery, [limit, offset]),
                db.query(countQuery)
            ]);

            const totalItems = parseInt(countResult.rows[0].count, 10);
            const totalPages = Math.ceil(totalItems / limit);

            return {
                data: dataResult.rows,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    limit
                }
            };
        } catch (error) {
            console.error("Erreur dans CultureService.getAll:", error);
            throw error; // Sera géré par le contrôleur ou le middleware d'erreur global
        }
    }

    /**
     * Récupère une culture spécifique par son ID.
     * @param {number} id - L'ID de la culture.
     * @returns {Promise<object|null>} - L'objet de la culture ou null si non trouvé.
     */
    async getById(id) {
        const query = 'SELECT * FROM cultures_catalogue WHERE id = $1;';
        try {
            const result = await db.query(query, [id]);
            if (result.rows.length === 0) {
                return null;
            }
            return result.rows[0];
        } catch (error) {
            console.error(`Erreur dans CultureService.getById pour l'ID ${id}:`, error);
            throw error;
        }
    }

    // Potentiellement, des méthodes pour administrateur (create, update, delete) pourraient être ajoutées ici.
    // async create(data) { ... }
    // async update(id, data) { ... }
    // async delete(id) { ... }
}

module.exports = new CultureService();