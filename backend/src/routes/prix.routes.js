// backend/src/routes/prix.routes.js
const express = require('express');
const router = express.Router();
const prixController = require('../controllers/prix.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// GET /api/prix/observations - Rechercher des observations de prix
// Accessible publiquement ou seulement aux utilisateurs connectés, selon votre choix
router.get('/observations', prixController.searchPrixObservations);

// POST /api/prix/observations - Ajouter une nouvelle observation de prix (protégé, admin/collecteur uniquement)
router.post('/observations', authenticateToken, authorizeRole(['admin', 'collecteur']), prixController.addPrixObservation);


// Routes pour la gestion des produits et régions (si admin)
// GET /api/prix/produits
router.get('/produits', prixController.getAllProduits);
// GET /api/prix/regions
router.get('/regions', prixController.getAllRegions);

// POST /api/prix/produits (admin)
// router.post('/produits', authenticateToken, authorizeRole(['admin']), prixController.addProduit);
// POST /api/prix/regions (admin)
// router.post('/regions', authenticateToken, authorizeRole(['admin']), prixController.addRegion);


module.exports = router;