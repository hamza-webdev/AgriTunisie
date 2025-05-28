// backend/src/controllers/prix.controller.js
const db = require('../config/db.config');

// Rechercher des observations de prix
exports.searchPrixObservations = async (req, res, next) => {
    const { produitId, regionId, dateStart, dateEnd, marcheNom } = req.query;
    let queryParams = [];
    let paramIndex = 1;

    let baseQuery = `
        SELECT
            opm.id,
            opm.date_observation,
            opm.prix_moyen_kg_ou_unite,
            opm.unite_prix,
            opm.nom_marche_specifique,
            opm.source_information,
            pa.nom_produit,
            pa.categorie_produit,
            rt.nom_region,
            rt.gouvernorat
        FROM observations_prix_marches opm
        JOIN produits_agricoles_prix pa ON opm.produit_id = pa.id
        JOIN regions_tunisie rt ON opm.region_id = rt.id
        WHERE 1=1
    `;

    if (produitId) {
        baseQuery += ` AND opm.produit_id = $${paramIndex++}`;
        queryParams.push(produitId);
    }
    if (regionId) {
        baseQuery += ` AND opm.region_id = $${paramIndex++}`;
        queryParams.push(regionId);
    }
    if (dateStart) {
        baseQuery += ` AND opm.date_observation >= $${paramIndex++}`;
        queryParams.push(dateStart);
    }
    if (dateEnd) {
        baseQuery += ` AND opm.date_observation <= $${paramIndex++}`;
        queryParams.push(dateEnd);
    }
    if (marcheNom) {
        baseQuery += ` AND opm.nom_marche_specifique ILIKE $${paramIndex++}`;
        queryParams.push(`%${marcheNom}%`);
    }

    baseQuery += ' ORDER BY opm.date_observation DESC, pa.nom_produit ASC;';

    try {
        const result = await db.query(baseQuery, queryParams);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erreur lors de la recherche des observations de prix:", error);
        next(error);
    }
};

// Ajouter une nouvelle observation de prix (pour admin/collecteur)
exports.addPrixObservation = async (req, res, next) => {
    // L'utilisateur (admin/collecteur) est identifié via req.user (authenticateToken)
    const { produit_id, region_id, nom_marche_specifique, prix_moyen_kg_ou_unite, unite_prix, date_observation, source_information } = req.body;

    // --- VALIDATION DES DONNÉES D'ENTRÉE (ESSENTIEL !) ---
    if (!produit_id || !region_id || !prix_moyen_kg_ou_unite || !date_observation) {
        return res.status(400).json({ message: "Produit, région, prix et date d'observation sont requis." });
    }

    try {
        const query = `
            INSERT INTO observations_prix_marches
            (produit_id, region_id, nom_marche_specifique, prix_moyen_kg_ou_unite, unite_prix, date_observation, source_information)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [produit_id, region_id, nom_marche_specifique, prix_moyen_kg_ou_unite, unite_prix || 'TND/kg', date_observation, source_information || `Collecteur ${req.user.id}`];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'observation de prix:", error);
        // Gérer les erreurs de clés étrangères si produit_id ou region_id n'existent pas
        if (error.code === '23503') { // foreign_key_violation
            return res.status(400).json({ message: "ID de produit ou de région invalide." });
        }
        next(error);
    }
};

// Lister tous les produits (pour les filtres par exemple)
exports.getAllProduits = async (req, res, next) => {
    try {
        const result = await db.query('SELECT id, nom_produit, categorie_produit FROM produits_agricoles_prix ORDER BY nom_produit;');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error);
        next(error);
    }
};

// Lister toutes les régions (pour les filtres)
exports.getAllRegions = async (req, res, next) => {
    try {
        const result = await db.query('SELECT id, nom_region, gouvernorat FROM regions_tunisie ORDER BY nom_region;');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erreur lors de la récupération des régions:", error);
        next(error);
    }
};

// Fonctions pour ajouter des produits/régions (admin) - STUBS
// exports.addProduit = async (req, res, next) => { /* ... logique pour admin ... */ };
// exports.addRegion = async (req, res, next) => { /* ... logique pour admin ... */ };