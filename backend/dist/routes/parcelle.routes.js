"use strict";

// backend/src/routes/parcelle.routes.js
const express = require('express');
const router = express.Router();
const parcelleController = require('../controllers/parcelle.controller');
const {
  authenticateToken
} = require('../middleware/auth.middleware'); // Middleware pour protéger les routes
const {
  parcelleValidationRules,
  parcelleIdValidationRules,
  validate
} = require('../middleware/validators/parcelle.validator');

// Toutes les routes pour les parcelles nécessitent une authentification
router.use(authenticateToken);

// POST /api/parcelles - Créer une nouvelle parcelle
router.post('/', parcelleController.createParcelle);

// GET /api/parcelles/user - Obtenir toutes les parcelles de l'utilisateur connecté
router.get('/user', parcelleController.getUserParcelles);

// GET /api/parcelles/:id - Obtenir une parcelle spécifique par son ID
router.get('/:id', parcelleController.getParcelleById);

// PUT /api/parcelles/:id - Mettre à jour une parcelle spécifique
router.put('/:id', parcelleController.updateParcelle);

// DELETE /api/parcelles/:id - Supprimer une parcelle spécifique
router.delete('/:id', parcelleController.deleteParcelle);
module.exports = router;