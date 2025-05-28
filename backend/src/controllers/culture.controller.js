// backend/src/controllers/culture.controller.js
const db = require('../config/db.config');

// Obtenir toutes les cultures du catalogue
exports.getAllCultures = async (req, res, next) => {
    try {
        const query = 'SELECT id, nom_culture, description_generale, periode_semis_ideale_debut, periode_semis_ideale_fin FROM cultures_catalogue ORDER BY nom_culture;';
        const result = await db.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Erreur lors de la récupération du catalogue des cultures:", error);
        next(error);
    }
};

// Obtenir une culture spécifique par son ID
exports.getCultureById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const query = 'SELECT * FROM cultures_catalogue WHERE id = $1;';
        const result = await db.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Culture non trouvée dans le catalogue." });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Erreur lors de la récupération de la culture:", error);
        next(error);
    }
};