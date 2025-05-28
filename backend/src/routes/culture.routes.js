// backend/src/routes/culture.routes.js
const express = require('express');
const router = express.Router();
const cultureController = require('../controllers/culture.controller');
// Pas besoin d'authenticateToken si c'est un catalogue public

// GET /api/cultures - Obtenir la liste de toutes les cultures du catalogue
router.get('/', cultureController.getAllCultures);

// GET /api/cultures/:id - Obtenir les détails d'une culture spécifique
router.get('/:id', cultureController.getCultureById);

module.exports = router;