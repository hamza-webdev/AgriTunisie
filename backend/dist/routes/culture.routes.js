"use strict";

// backend/src/routes/culture.routes.js
const express = require('express');
const router = express.Router();
const cultureController = require('../controllers/culture.controller');
const {
  cultureIdValidationRules,
  validate
} = require('../middleware/validators/culture.validator');
router.get('/', cultureController.getAllCultures);
router.get('/:id', cultureIdValidationRules(), validate, cultureController.getCultureById);

// Si vous ajoutez des routes admin :
// const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');
// const { cultureDataValidationRules } = require('../middleware/validators/culture.validator');
// router.post('/', authenticateToken, authorizeRole(['admin']), cultureDataValidationRules(), validate, cultureController.createCulture);
// router.put('/:id', authenticateToken, authorizeRole(['admin']), cultureIdValidationRules(), cultureDataValidationRules(), validate, cultureController.updateCulture);
// router.delete('/:id', authenticateToken, authorizeRole(['admin']), cultureIdValidationRules(), validate, cultureController.deleteCulture);

module.exports = router;