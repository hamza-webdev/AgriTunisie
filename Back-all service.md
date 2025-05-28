// Contenu des fichiers backend pour les modules Météo, Élevage, Communauté, et Gemini IA

// -----------------------------------------------------------------------------
// --- MISE À JOUR DU ROUTEUR PRINCIPAL ---
// -----------------------------------------------------------------------------

// backend/src/routes/index.routes.js (AJOUTER LES NOUVELLES ROUTES)
/*
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const parcelleRoutes = require('./parcelle.routes');
const cultureRoutes = require('./culture.routes');
const prixRoutes = require('./prix.routes');
const meteoRoutes = require('./meteo.routes'); // NOUVEAU
const elevageRoutes = require('./elevage.routes'); // NOUVEAU
const communauteRoutes = require('./communaute.routes'); // NOUVEAU
const geminiRoutes = require('./gemini.routes'); // NOUVEAU

router.use('/auth', authRoutes);
router.use('/parcelles', parcelleRoutes);
router.use('/cultures', cultureRoutes);
router.use('/prix', prixRoutes);
router.use('/meteo', meteoRoutes); // NOUVEAU
router.use('/elevage', elevageRoutes); // NOUVEAU
router.use('/communaute', communauteRoutes); // NOUVEAU
router.use('/gemini', geminiRoutes); // NOUVEAU

module.exports = router;
*/

// -----------------------------------------------------------------------------
// --- MODULE MÉTÉO ---
// -----------------------------------------------------------------------------

// backend/src/services/meteo.service.js
class MeteoService {
    /**
     * Récupère les prévisions météo pour une localisation donnée.
     * Cela impliquerait un appel à une API météo externe (ex: OpenWeatherMap).
     * @param {number} latitude
     * @param {number} longitude
     * @param {string} units - 'metric' ou 'imperial'
     * @returns {Promise<object>} - Données de prévision.
     */
    async getPrevisions(latitude, longitude, units = 'metric') {
        // SIMULATION d'un appel API externe
        // Dans une vraie application, utilisez 'axios' ou 'node-fetch' pour appeler une API météo.
        // Exemple: const apiKey = process.env.OPENWEATHERMAP_API_KEY;
        // const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${units}&appid=${apiKey}&lang=fr`;
        // const response = await axios.get(url);
        // return response.data;

        console.log(`MeteoService: Appel simulé pour prévisions à lat ${latitude}, lon ${longitude}`);
        // Données de simulation
        return Promise.resolve({
            message: "Prévisions météo simulées",
            latitude,
            longitude,
            units,
            forecast: [
                { date: "2025-05-29", temp_min: 15, temp_max: 25, description: "Ensoleillé", icon: "01d" },
                { date: "2025-05-30", temp_min: 16, temp_max: 26, description: "Partiellement nuageux", icon: "02d" },
            ],
            // Potentiellement, mettre en cache les résultats ici dans `donnees_meteo_cache`
        });
    }

    /**
     * Récupère l'historique météo pour une localisation et une période.
     * @param {number} latitude
     * @param {number} longitude
     * @param {string} dateStart - YYYY-MM-DD
     * @param {string} dateEnd - YYYY-MM-DD
     * @returns {Promise<object>} - Données historiques.
     */
    async getHistorique(latitude, longitude, dateStart, dateEnd) {
        // SIMULATION - Une API historique est souvent un service payant ou plus complexe.
        // Pourrait aussi lire depuis `donnees_meteo_cache` si peuplée régulièrement.
        console.log(`MeteoService: Appel simulé pour historique à lat ${latitude}, lon ${longitude} de ${dateStart} à ${dateEnd}`);
        return Promise.resolve({
            message: "Historique météo simulé",
            latitude,
            longitude,
            dateStart,
            dateEnd,
            data: [
                { date: "2025-05-01", temp_avg: 20, precipitation_mm: 0 },
            ]
        });
    }
}
// module.exports = new MeteoService(); // Décommentez pour l'utiliser

// backend/src/controllers/meteo.controller.js
const meteoServiceInstance = new (require('../services/meteo.service'))(); // Simule l'export/import

exports.getPrevisionsMeteo = async (req, res, next) => {
    const { latitude, longitude, units } = req.query; // Validés par le middleware
    try {
        const previsions = await meteoServiceInstance.getPrevisions(parseFloat(latitude), parseFloat(longitude), units);
        res.status(200).json(previsions);
    } catch (error) {
        console.error("Erreur contrôleur getPrevisionsMeteo:", error.message);
        // Gérer les erreurs spécifiques de l'API externe si nécessaire
        if (error.response && error.response.status) { // Erreur Axios par exemple
            return res.status(error.response.status).json({ message: error.response.data.message || "Erreur de l'API météo externe." });
        }
        next(error);
    }
};

exports.getHistoriqueMeteo = async (req, res, next) => {
    const { latitude, longitude, dateStart, dateEnd } = req.query; // Validés
    try {
        const historique = await meteoServiceInstance.getHistorique(parseFloat(latitude), parseFloat(longitude), dateStart, dateEnd);
        res.status(200).json(historique);
    } catch (error) {
        console.error("Erreur contrôleur getHistoriqueMeteo:", error.message);
        next(error);
    }
};

// backend/src/middleware/validators/meteo.validator.js
const { query, validationResult: meteoValidationResult } = require('express-validator');

const previsionsMeteoValidationRules = () => [
    query('latitude').notEmpty().withMessage('La latitude est requise.').isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide.'),
    query('longitude').notEmpty().withMessage('La longitude est requise.').isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide.'),
    query('units').optional().isIn(['metric', 'imperial']).withMessage("L'unité doit être 'metric' ou 'imperial'.")
];

const historiqueMeteoValidationRules = () => [
    query('latitude').notEmpty().isFloat({ min: -90, max: 90 }),
    query('longitude').notEmpty().isFloat({ min: -180, max: 180 }),
    query('dateStart').notEmpty().isISO8601().withMessage('La date de début doit être au format YYYY-MM-DD.'),
    query('dateEnd').notEmpty().isISO8601().withMessage('La date de fin doit être au format YYYY-MM-DD.')
        .custom((value, { req }) => {
            if (new Date(value) < new Date(req.query.dateStart)) {
                throw new Error('La date de fin ne peut être antérieure à la date de début.');
            }
            return true;
        }),
];

const validateMeteo = (req, res, next) => {
    const errors = meteoValidationResult(req);
    if (errors.isEmpty()) return next();
    const extractedErrors = errors.array().map(err => ({ [err.path]: err.msg }));
    return res.status(422).json({ message: "Erreurs de validation.", errors: extractedErrors });
};
// module.exports = { previsionsMeteoValidationRules, historiqueMeteoValidationRules, validateMeteo };

// backend/src/routes/meteo.routes.js
const expressMeteo = require('express');
const routerMeteo = expressMeteo.Router();
const meteoController = require('../controllers/meteo.controller'); // Assurez-vous que le chemin est correct
const meteoValidator = require('../middleware/validators/meteo.validator'); // Assurez-vous que le chemin est correct
const { authenticateToken: authenticateTokenMeteo } = require('../middleware/auth.middleware');

routerMeteo.use(authenticateTokenMeteo); // Protéger toutes les routes météo

routerMeteo.get('/previsions', meteoValidator.previsionsMeteoValidationRules(), meteoValidator.validateMeteo, meteoController.getPrevisionsMeteo);
routerMeteo.get('/historique', meteoValidator.historiqueMeteoValidationRules(), meteoValidator.validateMeteo, meteoController.getHistoriqueMeteo);

// module.exports = routerMeteo; // Décommentez pour l'utiliser


// -----------------------------------------------------------------------------
// --- MODULE ÉLEVAGE ---
// -----------------------------------------------------------------------------

// backend/src/services/elevage.service.js
const dbElevage = require('../config/db.config'); // Simule l'import

class ElevageService {
    async getTypesAnimaux({ page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const dataQuery = 'SELECT id, nom_espece, description_generale FROM animaux_types_catalogue ORDER BY nom_espece LIMIT $1 OFFSET $2;';
        const countQuery = 'SELECT COUNT(*) FROM animaux_types_catalogue;';
        const [dataResult, countResult] = await Promise.all([
            dbElevage.query(dataQuery, [limit, offset]),
            dbElevage.query(countQuery)
        ]);
        const totalItems = parseInt(countResult.rows[0].count, 10);
        return {
            data: dataResult.rows,
            pagination: { currentPage: page, totalPages: Math.ceil(totalItems / limit), totalItems, limit }
        };
    }

    async addAnimalUtilisateur(utilisateur_id, data) {
        const { animal_type_id, identifiant_animal, date_naissance_approx, notes_sante } = data;
        const query = `INSERT INTO animaux_elevage_utilisateur (utilisateur_id, animal_type_id, identifiant_animal, date_naissance_approx, notes_sante)
                       VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
        const result = await dbElevage.query(query, [utilisateur_id, animal_type_id, identifiant_animal, date_naissance_approx, notes_sante]);
        return result.rows[0];
    }

    async getAnimauxUtilisateur(utilisateur_id, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const dataQuery = `SELECT aeu.*, atc.nom_espece 
                       FROM animaux_elevage_utilisateur aeu
                       JOIN animaux_types_catalogue atc ON aeu.animal_type_id = atc.id
                       WHERE aeu.utilisateur_id = $1 ORDER BY aeu.id DESC LIMIT $2 OFFSET $3;`;
        const countQuery = 'SELECT COUNT(*) FROM animaux_elevage_utilisateur WHERE utilisateur_id = $1;';
        const [dataResult, countResult] = await Promise.all([
            dbElevage.query(dataQuery, [utilisateur_id, limit, offset]),
            dbElevage.query(countQuery, [utilisateur_id])
        ]);
        const totalItems = parseInt(countResult.rows[0].count, 10);
        return {
            data: dataResult.rows,
            pagination: { currentPage: page, totalPages: Math.ceil(totalItems / limit), totalItems, limit }
        };
    }
    
    async getAnimalUtilisateurById(id, utilisateur_id) {
        const query = `SELECT aeu.*, atc.nom_espece 
                       FROM animaux_elevage_utilisateur aeu
                       JOIN animaux_types_catalogue atc ON aeu.animal_type_id = atc.id
                       WHERE aeu.id = $1 AND aeu.utilisateur_id = $2;`;
        const result = await dbElevage.query(query, [id, utilisateur_id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async updateAnimalUtilisateur(id, utilisateur_id, data) {
        const { animal_type_id, identifiant_animal, date_naissance_approx, notes_sante } = data;
        // Construire la requête dynamiquement pour ne mettre à jour que les champs fournis
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (animal_type_id !== undefined) { fields.push(`animal_type_id = $${paramCount++}`); values.push(animal_type_id); }
        if (identifiant_animal !== undefined) { fields.push(`identifiant_animal = $${paramCount++}`); values.push(identifiant_animal); }
        if (date_naissance_approx !== undefined) { fields.push(`date_naissance_approx = $${paramCount++}`); values.push(date_naissance_approx); }
        if (notes_sante !== undefined) { fields.push(`notes_sante = $${paramCount++}`); values.push(notes_sante); }
        
        if (fields.length === 0) throw { status: 400, message: "Aucun champ à mettre à jour." };

        values.push(id);
        values.push(utilisateur_id);
        const query = `UPDATE animaux_elevage_utilisateur SET ${fields.join(', ')}
                       WHERE id = $${paramCount++} AND utilisateur_id = $${paramCount} RETURNING *;`;
        const result = await dbElevage.query(query, values);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async deleteAnimalUtilisateur(id, utilisateur_id) {
        const query = 'DELETE FROM animaux_elevage_utilisateur WHERE id = $1 AND utilisateur_id = $2 RETURNING id;';
        const result = await dbElevage.query(query, [id, utilisateur_id]);
        return result.rowCount > 0;
    }
}
// module.exports = new ElevageService();

// backend/src/controllers/elevage.controller.js
const elevageServiceInstance = new (require('../services/elevage.service'))();

exports.getTypesAnimaux = async (req, res, next) => {
    const { page, limit } = req.query;
    try {
        const result = await elevageServiceInstance.getTypesAnimaux({ page: parseInt(page) || 1, limit: parseInt(limit) || 10 });
        res.status(200).json(result);
    } catch (error) { next(error); }
};
exports.addAnimalUtilisateur = async (req, res, next) => {
    try {
        const animal = await elevageServiceInstance.addAnimalUtilisateur(req.user.id, req.body);
        res.status(201).json(animal);
    } catch (error) {
        if (error.code === '23503') return res.status(400).json({ message: "Type d'animal invalide." }); // Foreign key violation
        next(error);
    }
};
exports.getAnimauxUtilisateur = async (req, res, next) => {
    const { page, limit } = req.query;
    try {
        const result = await elevageServiceInstance.getAnimauxUtilisateur(req.user.id, { page: parseInt(page) || 1, limit: parseInt(limit) || 10 });
        res.status(200).json(result);
    } catch (error) { next(error); }
};
exports.getAnimalUtilisateur = async (req, res, next) => {
    try {
        const animal = await elevageServiceInstance.getAnimalUtilisateurById(req.params.id, req.user.id);
        if (!animal) return res.status(404).json({ message: "Animal non trouvé ou accès non autorisé." });
        res.status(200).json(animal);
    } catch (error) { next(error); }
};
exports.updateAnimalUtilisateur = async (req, res, next) => {
    try {
        const animal = await elevageServiceInstance.updateAnimalUtilisateur(req.params.id, req.user.id, req.body);
        if (!animal) return res.status(404).json({ message: "Animal non trouvé ou accès non autorisé pour la mise à jour." });
        res.status(200).json(animal);
    } catch (error) {
        if (error.status === 400) return res.status(400).json({ message: error.message });
        if (error.code === '23503') return res.status(400).json({ message: "Type d'animal invalide pour la mise à jour." });
        next(error);
    }
};
exports.deleteAnimalUtilisateur = async (req, res, next) => {
    try {
        const deleted = await elevageServiceInstance.deleteAnimalUtilisateur(req.params.id, req.user.id);
        if (!deleted) return res.status(404).json({ message: "Animal non trouvé ou accès non autorisé pour la suppression." });
        res.status(200).json({ message: "Animal supprimé avec succès." });
    } catch (error) { next(error); }
};

// backend/src/middleware/validators/elevage.validator.js (Squelette)
const { body: bodyElevage, param: paramElevage, query: queryElevage, validationResult: elevageValidationResult } = require('express-validator');

const addAnimalUtilisateurRules = () => [
    bodyElevage('animal_type_id').notEmpty().isInt({ min: 1 }).withMessage("ID du type d'animal requis et valide."),
    bodyElevage('identifiant_animal').optional().isString().trim().isLength({ max: 100 }),
    bodyElevage('date_naissance_approx').optional().isISO8601().withMessage("Date de naissance approximative invalide."),
    bodyElevage('notes_sante').optional().isString().trim()
];
const animalIdRules = () => [paramElevage('id').isInt({ min: 1 }).withMessage("ID de l'animal invalide.")];
const paginationRulesElevage = () => [
    queryElevage('page').optional().isInt({ min: 1 }).toInt(),
    queryElevage('limit').optional().isInt({ min: 1, max: 100 }).toInt()
];
const validateElevage = (req, res, next) => {
    const errors = elevageValidationResult(req);
    if (errors.isEmpty()) return next();
    return res.status(422).json({ message: "Erreurs de validation.", errors: errors.array().map(e => ({ [e.path]: e.msg })) });
};
// module.exports = { addAnimalUtilisateurRules, animalIdRules, paginationRulesElevage, validateElevage };

// backend/src/routes/elevage.routes.js
const expressElevage = require('express');
const routerElevage = expressElevage.Router();
const elevageController = require('../controllers/elevage.controller');
const elevageValidator = require('../middleware/validators/elevage.validator');
const { authenticateToken: authenticateTokenElevage } = require('../middleware/auth.middleware');

routerElevage.get('/types', elevageValidator.paginationRulesElevage(), elevageValidator.validateElevage, elevageController.getTypesAnimaux); // Catalogue public

routerElevage.use(authenticateTokenElevage); // Routes suivantes protégées
routerElevage.post('/animaux', elevageValidator.addAnimalUtilisateurRules(), elevageValidator.validateElevage, elevageController.addAnimalUtilisateur);
routerElevage.get('/animaux', elevageValidator.paginationRulesElevage(), elevageValidator.validateElevage, elevageController.getAnimauxUtilisateur);
routerElevage.get('/animaux/:id', elevageValidator.animalIdRules(), elevageValidator.validateElevage, elevageController.getAnimalUtilisateur);
routerElevage.put('/animaux/:id', elevageValidator.animalIdRules(), elevageValidator.addAnimalUtilisateurRules(), elevageValidator.validateElevage, elevageController.updateAnimalUtilisateur); // addAnimalUtilisateurRules peut être réutilisé ou adapté pour la mise à jour
routerElevage.delete('/animaux/:id', elevageValidator.animalIdRules(), elevageValidator.validateElevage, elevageController.deleteAnimalUtilisateur);

// module.exports = routerElevage;


// -----------------------------------------------------------------------------
// --- MODULE COMMUNAUTÉ (FORUM) ---
// -----------------------------------------------------------------------------

// backend/src/services/communaute.service.js
const dbCommunaute = require('../config/db.config');

class CommunauteService {
    // Catégories
    async getCategories({ page = 1, limit = 20 }) {
        const offset = (page - 1) * limit;
        const dataQuery = 'SELECT * FROM forum_categories ORDER BY nom_categorie LIMIT $1 OFFSET $2;';
        const countQuery = 'SELECT COUNT(*) FROM forum_categories;';
        const [data, count] = await Promise.all([dbCommunaute.query(dataQuery, [limit, offset]), dbCommunaute.query(countQuery)]);
        return { data: data.rows, pagination: { currentPage: page, totalPages: Math.ceil(parseInt(count.rows[0].count)/limit), totalItems: parseInt(count.rows[0].count), limit } };
    }
    // Posts
    async createPost(utilisateur_id, data) {
        const { categorie_id, titre_post, contenu_post } = data;
        const q = 'INSERT INTO forum_posts (utilisateur_id, categorie_id, titre_post, contenu_post) VALUES ($1, $2, $3, $4) RETURNING *;';
        const res = await dbCommunaute.query(q, [utilisateur_id, categorie_id, titre_post, contenu_post]);
        return res.rows[0];
    }
    async getPostsByCategorie(categorie_id, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const dataQ = `SELECT fp.*, u.nom_complet as auteur_nom, u.email as auteur_email 
                       FROM forum_posts fp JOIN utilisateurs u ON fp.utilisateur_id = u.id 
                       WHERE fp.categorie_id = $1 ORDER BY fp.dernier_commentaire_date DESC, fp.date_creation DESC LIMIT $2 OFFSET $3;`;
        const countQ = 'SELECT COUNT(*) FROM forum_posts WHERE categorie_id = $1;';
        const [data, count] = await Promise.all([dbCommunaute.query(dataQ, [categorie_id, limit, offset]), dbCommunaute.query(countQ, [categorie_id])]);
        return { data: data.rows, pagination: { currentPage: page, totalPages: Math.ceil(parseInt(count.rows[0].count)/limit), totalItems: parseInt(count.rows[0].count), limit } };
    }
    async getPostById(post_id) {
        const q = `SELECT fp.*, u.nom_complet as auteur_nom, u.email as auteur_email 
                   FROM forum_posts fp JOIN utilisateurs u ON fp.utilisateur_id = u.id 
                   WHERE fp.id = $1;`;
        const res = await dbCommunaute.query(q, [post_id]);
        return res.rows.length > 0 ? res.rows[0] : null;
    }
    // Commentaires
    async addComment(post_id, utilisateur_id, contenu_commentaire) {
        // Mettre à jour dernier_commentaire_date sur le post aussi (transaction serait mieux)
        await dbCommunaute.query('UPDATE forum_posts SET dernier_commentaire_date = NOW() WHERE id = $1;', [post_id]);
        const q = 'INSERT INTO forum_commentaires (post_id, utilisateur_id, contenu_commentaire) VALUES ($1, $2, $3) RETURNING *;';
        const res = await dbCommunaute.query(q, [post_id, utilisateur_id, contenu_commentaire]);
        return res.rows[0];
    }
    async getCommentsByPost(post_id, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const dataQ = `SELECT fc.*, u.nom_complet as auteur_nom, u.email as auteur_email
                       FROM forum_commentaires fc JOIN utilisateurs u ON fc.utilisateur_id = u.id
                       WHERE fc.post_id = $1 ORDER BY fc.date_creation ASC LIMIT $2 OFFSET $3;`;
        const countQ = 'SELECT COUNT(*) FROM forum_commentaires WHERE post_id = $1;';
        const [data, count] = await Promise.all([dbCommunaute.query(dataQ, [post_id, limit, offset]), dbCommunaute.query(countQ, [post_id])]);
        return { data: data.rows, pagination: { currentPage: page, totalPages: Math.ceil(parseInt(count.rows[0].count)/limit), totalItems: parseInt(count.rows[0].count), limit } };
    }
}
// module.exports = new CommunauteService();

// backend/src/controllers/communaute.controller.js
const communauteServiceInstance = new (require('../services/communaute.service'))();

exports.getCategories = async (req, res, next) => {
    const { page, limit } = req.query;
    try { res.json(await communauteServiceInstance.getCategories({ page: parseInt(page) || 1, limit: parseInt(limit) || 20 })); }
    catch (e) { next(e); }
};
exports.createPost = async (req, res, next) => {
    try { res.status(201).json(await communauteServiceInstance.createPost(req.user.id, req.body)); }
    catch (e) {
        if (e.code === '23503') return res.status(400).json({ message: "Catégorie invalide." });
        next(e);
    }
};
exports.getPosts = async (req, res, next) => { // getPostsByCategorie
    const { categorieId } = req.params;
    const { page, limit } = req.query;
    try { res.json(await communauteServiceInstance.getPostsByCategorie(categorieId, { page: parseInt(page) || 1, limit: parseInt(limit) || 10 })); }
    catch (e) { next(e); }
};
exports.getPostDetails = async (req, res, next) => {
    try {
        const post = await communauteServiceInstance.getPostById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post non trouvé." });
        res.json(post);
    } catch (e) { next(e); }
};
exports.addCommentToPost = async (req, res, next) => {
    const { postId } = req.params;
    const { contenu_commentaire } = req.body;
    try {
        // Vérifier si le post existe d'abord
        const postExists = await communauteServiceInstance.getPostById(postId);
        if (!postExists) return res.status(404).json({ message: "Post non trouvé pour commenter." });
        res.status(201).json(await communauteServiceInstance.addComment(postId, req.user.id, contenu_commentaire));
    } catch (e) { next(e); }
};
exports.getCommentsForPost = async (req, res, next) => {
    const { postId } = req.params;
    const { page, limit } = req.query;
    try { res.json(await communauteServiceInstance.getCommentsByPost(postId, { page: parseInt(page) || 1, limit: parseInt(limit) || 10 })); }
    catch (e) { next(e); }
};

// backend/src/middleware/validators/communaute.validator.js (Squelette)
const { body: bodyComm, param: paramComm, query: queryComm, validationResult: commValidationResult } = require('express-validator');

const createPostRules = () => [
    bodyComm('categorie_id').notEmpty().isInt({min: 1}),
    bodyComm('titre_post').trim().notEmpty().isLength({min: 5, max: 255}),
    bodyComm('contenu_post').trim().notEmpty().isLength({min: 10})
];
const addCommentRules = () => [bodyComm('contenu_commentaire').trim().notEmpty().isLength({min: 1})];
const idParamRules = (paramName) => [paramComm(paramName).isInt({min: 1})];
const paginationRulesComm = () => [queryComm('page').optional().isInt({min:1}).toInt(), queryComm('limit').optional().isInt({min:1, max:50}).toInt()];
const validateComm = (req, res, next) => { /* ... (même que validateElevage) ... */
    const errors = commValidationResult(req);
    if (errors.isEmpty()) return next();
    return res.status(422).json({ message: "Erreurs de validation.", errors: errors.array().map(e => ({ [e.path]: e.msg })) });
};
// module.exports = { createPostRules, addCommentRules, idParamRules, paginationRulesComm, validateComm };

// backend/src/routes/communaute.routes.js
const expressComm = require('express');
const routerComm = expressComm.Router();
const commController = require('../controllers/communaute.controller');
const commValidator = require('../middleware/validators/communaute.validator');
const { authenticateToken: authenticateTokenComm } = require('../middleware/auth.middleware');

routerComm.get('/categories', commValidator.paginationRulesComm(), commValidator.validateComm, commController.getCategories);
routerComm.get('/posts/categorie/:categorieId', commValidator.idParamRules('categorieId'), commValidator.paginationRulesComm(), commValidator.validateComm, commController.getPosts);
routerComm.get('/posts/:postId', commValidator.idParamRules('postId'), commValidator.validateComm, commController.getPostDetails);
routerComm.get('/posts/:postId/commentaires', commValidator.idParamRules('postId'), commValidator.paginationRulesComm(), commValidator.validateComm, commController.getCommentsForPost);

routerComm.use(authenticateTokenComm); // Routes suivantes protégées
routerComm.post('/posts', commValidator.createPostRules(), commValidator.validateComm, commController.createPost);
routerComm.post('/posts/:postId/commentaires', commValidator.idParamRules('postId'), commValidator.addCommentRules(), commValidator.validateComm, commController.addCommentToPost);

// module.exports = routerComm;


// -----------------------------------------------------------------------------
// --- MODULE GEMINI IA ---
// -----------------------------------------------------------------------------

// backend/src/services/gemini.service.js
// const { GoogleGenerativeAI } = require("@google/generative-ai"); // Nécessite npm install @google/generative-ai

class GeminiService {
    constructor() {
        // this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Ou autre modèle
        console.log("GeminiService: Initialisation simulée (API Key non configurée réellement ici)");
    }

    async getConseilCulture(donneesParcelle, cultureInfo, historiqueMeteoLocal) {
        // SIMULATION: Construire un prompt détaillé et appeler l'API Gemini
        const prompt = `
            Agissant en tant qu'expert agronome pour la Tunisie, fournissez des conseils de culture détaillés.
            Parcelle: ${JSON.stringify(donneesParcelle)}.
            Culture envisagée: ${JSON.stringify(cultureInfo)}.
            Historique météo récent: ${JSON.stringify(historiqueMeteoLocal)}.
            Conseils attendus: préparation du sol, période de semis optimale, fertilisation, irrigation, gestion des nuisibles.
        `;
        console.log("GeminiService: Prompt simulé pour conseil culture:", prompt.substring(0, 200) + "...");

        // try {
        //   const result = await this.model.generateContent(prompt);
        //   const response = await result.response;
        //   const text = response.text();
        //   // Enregistrer l'interaction dans logs_interactions_gemini
        //   return { conseil: text };
        // } catch (error) {
        //   console.error("Erreur API Gemini (conseil culture):", error);
        //   throw { status: 500, message: "Erreur lors de la génération du conseil par l'IA." };
        // }
        return Promise.resolve({ conseil: "Conseil de culture simulé par l'IA : Assurez un bon drainage et une fertilisation équilibrée." });
    }

    async optimiserRationAnimale(typeAnimal, alimentsDisponibles, stadeProduction) {
        const prompt = `
            Expert en nutrition animale, optimisez une ration pour:
            Type d'animal: ${typeAnimal}.
            Aliments disponibles localement: ${JSON.stringify(alimentsDisponibles)}.
            Stade de production: ${stadeProduction}.
            Fournissez une composition de ration équilibrée et des recommandations.
        `;
        console.log("GeminiService: Prompt simulé pour optimisation ration:", prompt.substring(0, 200) + "...");
        // ... appel API simulé ...
        return Promise.resolve({ ration: "Ration optimisée simulée : 60% fourrage, 30% concentré, 10% compléments. Eau à volonté." });
    }
    
    async resumerTexteActualite(texte) {
        if (!texte || texte.trim().length < 50) { // Validation basique
            throw { status: 400, message: "Texte trop court pour être résumé."};
        }
        const prompt = `Résumez le texte d'actualité agricole suivant en 3 points clés maximum:\n\n${texte}`;
        console.log("GeminiService: Prompt simulé pour résumé actualité:", prompt.substring(0,200) + "...");
        // ... appel API simulé ...
        return Promise.resolve({ resume: "Résumé simulé: 1. Nouvelle subvention. 2. Alerte sécheresse. 3. Innovation technique."});
    }
}
// module.exports = new GeminiService();

// backend/src/controllers/gemini.controller.js
const geminiServiceInstance = new (require('../services/gemini.service'))();
// Simuler db pour log (dans une vraie app, ce serait le service db)
const dbLogGemini = { query: (q, v) => console.log("DB LOG GEMINI:", q, v) };


exports.getConseilCultureIA = async (req, res, next) => {
    const utilisateur_id = req.user.id;
    // Supposons que req.body contient { donneesParcelle, cultureInfo, historiqueMeteoLocal }
    // Ces données pourraient être récupérées par d'autres services avant d'appeler celui-ci.
    const { donneesParcelle, cultureInfo, historiqueMeteoLocal } = req.body;
    
    // Validation basique
    if (!donneesParcelle || !cultureInfo) {
        return res.status(400).json({ message: "Données de parcelle et informations sur la culture requises." });
    }

    try {
        const resultat = await geminiServiceInstance.getConseilCulture(donneesParcelle, cultureInfo, historiqueMeteoLocal);
        // Log l'interaction
        await dbLogGemini.query(
            'INSERT INTO logs_interactions_gemini (utilisateur_id, type_requete_gemini, prompt_envoye, reponse_recue, succes_appel) VALUES ($1, $2, $3, $4, $5)',
            [utilisateur_id, 'conseil_culture', 'Prompt simulé...', JSON.stringify(resultat), true]
        );
        res.json(resultat);
    } catch (error) {
        await dbLogGemini.query(
            'INSERT INTO logs_interactions_gemini (utilisateur_id, type_requete_gemini, prompt_envoye, erreur_message, succes_appel) VALUES ($1, $2, $3, $4, $5)',
            [utilisateur_id, 'conseil_culture', 'Prompt simulé...', error.message, false]
        );
        if (error.status) return res.status(error.status).json({ message: error.message });
        next(error);
    }
};

exports.optimiserRationIA = async (req, res, next) => {
    const utilisateur_id = req.user.id;
    const { typeAnimal, alimentsDisponibles, stadeProduction } = req.body;
    if (!typeAnimal || !alimentsDisponibles || !stadeProduction) {
        return res.status(400).json({ message: "Type d'animal, aliments disponibles et stade de production requis." });
    }
    try {
        const resultat = await geminiServiceInstance.optimiserRationAnimale(typeAnimal, alimentsDisponibles, stadeProduction);
        // Log
        res.json(resultat);
    } catch (error) {
        // Log erreur
        if (error.status) return res.status(error.status).json({ message: error.message });
        next(error);
    }
};

exports.resumerActualiteIA = async (req, res, next) => {
    const utilisateur_id = req.user.id;
    const { texte_actualite } = req.body;
     if (!texte_actualite || texte_actualite.trim().length < 50) { // Validation du contrôleur
        return res.status(400).json({ message: "Le texte de l'actualité est requis et doit contenir au moins 50 caractères." });
    }
    try {
        const resultat = await geminiServiceInstance.resumerTexteActualite(texte_actualite);
        // Log
        res.json(resultat);
    } catch (error) {
        // Log erreur
        if (error.status) return res.status(error.status).json({ message: error.message });
        next(error);
    }
};

// backend/src/middleware/validators/gemini.validator.js (Squelette)
const { body: bodyGemini, validationResult: geminiValidationResult } = require('express-validator');

const conseilCultureRules = () => [
    bodyGemini('donneesParcelle').notEmpty().isObject().withMessage("Données de parcelle requises et doivent être un objet."),
    bodyGemini('cultureInfo').notEmpty().isObject().withMessage("Informations sur la culture requises et doivent être un objet."),
    bodyGemini('historiqueMeteoLocal').optional().isObject()
];
const optimiserRationRules = () => [
    bodyGemini('typeAnimal').notEmpty().isString(),
    bodyGemini('alimentsDisponibles').notEmpty().isArray({min:1}).withMessage("Liste d'aliments disponibles requise."),
    bodyGemini('stadeProduction').notEmpty().isString()
];
const resumerActualiteRules = () => [
    bodyGemini('texte_actualite').trim().notEmpty().isLength({min: 50, max: 10000}).withMessage("Texte d'actualité requis (50-10000 caractères).")
];

const validateGemini = (req, res, next) => { /* ... (même que validateElevage) ... */
    const errors = geminiValidationResult(req);
    if (errors.isEmpty()) return next();
    return res.status(422).json({ message: "Erreurs de validation.", errors: errors.array().map(e => ({ [e.path]: e.msg })) });
};
// module.exports = { conseilCultureRules, optimiserRationRules, resumerActualiteRules, validateGemini };

// backend/src/routes/gemini.routes.js
const expressGemini = require('express');
const routerGemini = expressGemini.Router();
const geminiController = require('../controllers/gemini.controller');
const geminiValidator = require('../middleware/validators/gemini.validator');
const { authenticateToken: authenticateTokenGemini } = require('../middleware/auth.middleware');

routerGemini.use(authenticateTokenGemini); // Toutes les routes Gemini protégées

routerGemini.post('/conseil-culture', geminiValidator.conseilCultureRules(), geminiValidator.validateGemini, geminiController.getConseilCultureIA);
routerGemini.post('/optimiser-ration', geminiValidator.optimiserRationRules(), geminiValidator.validateGemini, geminiController.optimiserRationIA);
routerGemini.post('/resumer-actualite', geminiValidator.resumerActualiteRules(), geminiValidator.validateGemini, geminiController.resumerActualiteIA);

// module.exports = routerGemini; // Décommentez pour l'utiliser

