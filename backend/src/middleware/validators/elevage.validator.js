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
module.exports = { addAnimalUtilisateurRules, animalIdRules, paginationRulesElevage, validateElevage };
