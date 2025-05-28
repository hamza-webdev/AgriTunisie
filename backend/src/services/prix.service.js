// backend/src/services/prix.service.js
const db = require('../config/db.config');

class PrixService {
    /**
     * Recherche des observations de prix avec filtres et pagination.
     * @param {object} filters - Critères de recherche { produitId, regionId, dateStart, dateEnd, marcheNom }.
     * @param {object} paginationOptions - Options de pagination { page, limit }.
     * @returns {Promise<object>} - Un objet contenant les données et les informations de pagination.
     */
    async searchObservations(filters, { page = 1, limit = 10 }) {
        const { produitId, regionId, dateStart, dateEnd, marcheNom } = filters;
        const offset = (page - 1) * limit;

        let queryParams = [];
        let paramIndex = 1;
        let whereClauses = [];

        let baseQuery = `
            SELECT
                opm.id, opm.date_observation, opm.prix_moyen_kg_ou_unite, opm.unite_prix,
                opm.nom_marche_specifique, opm.source_information,
                pa.nom_produit, pa.categorie_produit,
                rt.nom_region, rt.gouvernorat
            FROM observations_prix_marches opm
            JOIN produits_agricoles_prix pa ON opm.produit_id = pa.id
            JOIN regions_tunisie rt ON opm.region_id = rt.id
        `;

        let countBaseQuery = `
            SELECT COUNT(opm.*)
            FROM observations_prix_marches opm
            JOIN produits_agricoles_prix pa ON opm.produit_id = pa.id
            JOIN regions_tunisie rt ON opm.region_id = rt.id
        `;

        if (produitId) {
            whereClauses.push(`opm.produit_id = $${paramIndex++}`);
            queryParams.push(produitId);
        }
        if (regionId) {
            whereClauses.push(`opm.region_id = $${paramIndex++}`);
            queryParams.push(regionId);
        }
        if (dateStart) {
            whereClauses.push(`opm.date_observation >= $${paramIndex++}`);
            queryParams.push(dateStart);
        }
        if (dateEnd) {
            whereClauses.push(`opm.date_observation <= $${paramIndex++}`);
            queryParams.push(dateEnd);
        }
        if (marcheNom) {
            whereClauses.push(`opm.nom_marche_specifique ILIKE $${paramIndex++}`);
            queryParams.push(`%${marcheNom}%`);
        }

        if (whereClauses.length > 0) {
            const whereString = ` WHERE ${whereClauses.join(' AND ')}`;
            baseQuery += whereString;
            countBaseQuery += whereString;
        }

        baseQuery += ` ORDER BY opm.date_observation DESC, pa.nom_produit ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++};`;
        const dataQueryParams = [...queryParams, limit, offset];
        // Les queryParams pour countBaseQuery n'incluent pas limit et offset

        try {
            const [dataResult, countResult] = await Promise.all([
                db.query(baseQuery, dataQueryParams),
                db.query(countBaseQuery, queryParams) // Utiliser queryParams sans limit/offset
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
            console.error("Erreur dans PrixService.searchObservations:", error);
            throw error;
        }
    }

    /**
     * Ajoute une nouvelle observation de prix.
     * @param {object} data - Données de l'observation.
     * @param {object} user - Informations sur l'utilisateur (collecteur/admin).
     * @returns {Promise<object>} - L'observation de prix créée.
     */
    async addObservation(data, user) {
        const { produit_id, region_id, nom_marche_specifique, prix_moyen_kg_ou_unite, unite_prix, date_observation, source_information_input } = data;
        const source_info = source_information_input || `Collecteur: ${user.nom_complet} (ID: ${user.id})`;

        const query = `
            INSERT INTO observations_prix_marches
            (produit_id, region_id, nom_marche_specifique, prix_moyen_kg_ou_unite, unite_prix, date_observation, source_information)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [produit_id, region_id, nom_marche_specifique, prix_moyen_kg_ou_unite, unite_prix || 'TND/kg', date_observation, source_info];

        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23503') { // foreign_key_violation
                // Vérifier quelle clé étrangère a échoué peut être plus complexe sans ORM
                // On peut essayer de vérifier si produit_id ou region_id existent
                const produitExists = await db.query('SELECT 1 FROM produits_agricoles_prix WHERE id = $1', [produit_id]);
                const regionExists = await db.query('SELECT 1 FROM regions_tunisie WHERE id = $1', [region_id]);

                let message = "ID de produit ou de région invalide.";
                if (produitExists.rowCount === 0) message = "ID de produit invalide.";
                else if (regionExists.rowCount === 0) message = "ID de région invalide.";

                throw { status: 400, message };
            }
            console.error("Erreur dans PrixService.addObservation:", error);
            throw error;
        }
    }

    /**
     * Récupère tous les produits agricoles pour les filtres.
     * @returns {Promise<Array<object>>}
     */
    async getAllProduits() {
        try {
            const result = await db.query('SELECT id, nom_produit, categorie_produit FROM produits_agricoles_prix ORDER BY nom_produit;');
            return result.rows;
        } catch (error) {
            console.error("Erreur dans PrixService.getAllProduits:", error);
            throw error;
        }
    }

    /**
     * Récupère toutes les régions pour les filtres.
     * @returns {Promise<Array<object>>}
     */
    async getAllRegions() {
        try {
            const result = await db.query('SELECT id, nom_region, gouvernorat FROM regions_tunisie ORDER BY nom_region;');
            return result.rows;
        } catch (error) {
            console.error("Erreur dans PrixService.getAllRegions:", error);
            throw error;
        }
    }
}

module.exports = new PrixService();