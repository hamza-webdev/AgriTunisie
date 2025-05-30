"use strict";

// backend/src/routes/prix.routes.js
const express = require('express');
const router = express.Router();
const prixController = require('../controllers/prix.controller');
const {
  authenticateToken,
  authorizeRole
} = require('../middleware/auth.middleware');
const {
  searchPrixValidationRules,
  addObservationValidationRules,
  validate
} = require('../middleware/validators/prix.validator');
router.get('/observations', searchPrixValidationRules(), validate, prixController.searchPrixObservations);
router.post('/observations', authenticateToken, authorizeRole(['admin', 'collecteur']),
// Seuls les admins ou collecteurs peuvent ajouter
addObservationValidationRules(), validate, prixController.addPrixObservation);
router.get('/produits', prixController.getAllProduits);
router.get('/regions', prixController.getAllRegions);
module.exports = router;