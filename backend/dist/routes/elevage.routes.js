"use strict";

// backend/src/routes/elevage.routes.js
const expressElevage = require('express');
const routerElevage = expressElevage.Router();
const elevageController = require('../controllers/elevage.controller');
const elevageValidator = require('../middleware/validators/elevage.validator');
const {
  authenticateToken: authenticateTokenElevage
} = require('../middleware/auth.middleware');
routerElevage.get('/types', elevageValidator.paginationRulesElevage(), elevageValidator.validateElevage, elevageController.getTypesAnimaux); // Catalogue public

routerElevage.use(authenticateTokenElevage); // Routes suivantes protégées
routerElevage.post('/animaux', elevageValidator.addAnimalUtilisateurRules(), elevageValidator.validateElevage, elevageController.addAnimalUtilisateur);
routerElevage.get('/animaux', elevageValidator.paginationRulesElevage(), elevageValidator.validateElevage, elevageController.getAnimauxUtilisateur);
routerElevage.get('/animaux/:id', elevageValidator.animalIdRules(), elevageValidator.validateElevage, elevageController.getAnimalUtilisateur);
routerElevage.put('/animaux/:id', elevageValidator.animalIdRules(), elevageValidator.addAnimalUtilisateurRules(), elevageValidator.validateElevage, elevageController.updateAnimalUtilisateur); // addAnimalUtilisateurRules peut être réutilisé ou adapté pour la mise à jour
routerElevage.delete('/animaux/:id', elevageValidator.animalIdRules(), elevageValidator.validateElevage, elevageController.deleteAnimalUtilisateur);
module.exports = routerElevage;