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

module.exports = routerElevage;