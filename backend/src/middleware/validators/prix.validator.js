// backend/src/middleware/validators/prix.validator.js
const { body, query, validationResult } = require('express-validator');

const searchPrixValidationRules = () => {
    return [
        query('produitId').optional().isInt({ min: 1 }).withMessage('L\'ID du produit doit être un entier positif.').toInt(),
        query('regionId').optional().isInt({ min: 1 }).withMessage('L\'ID de la région doit être un entier positif.').toInt(),
        query('dateStart').optional().isISO8601().withMessage('La date de début doit être au format ISO8601 (YYYY-MM-DD).').toDate(),
        query('dateEnd').optional().isISO8601().withMessage('La date de fin doit être au format ISO8601 (YYYY-MM-DD).').toDate()
            .custom((value, { req }) => {
                if (req.query.dateStart && value < req.query.dateStart) {
                    throw new Error('La date de fin ne peut pas être antérieure à la date de début.');
                }
                return true;
            }),
        query('marcheNom').optional().isString().trim(),
        query('page').optional().isInt({ min: 1 }).withMessage('Le numéro de page doit être un entier positif.').toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('La limite doit être un entier entre 1 et 100.').toInt(),
    ];
};

const addObservationValidationRules = () => {
    return [
        body('produit_id').notEmpty().withMessage('L\'ID du produit est requis.').isInt({ min: 1 }).withMessage('L\'ID du produit doit être un entier positif.').toInt(),
        body('region_id').notEmpty().withMessage('L\'ID de la région est requis.').isInt({ min: 1 }).withMessage('L\'ID de la région doit être un entier positif.').toInt(),
        body('nom_marche_specifique').optional().isString().trim().isLength({ max: 255 }),
        body('prix_moyen_kg_ou_unite').notEmpty().withMessage('Le prix est requis.').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif.').toFloat(),
        body('unite_prix').optional().isString().trim().isLength({ max: 20 }),
        body('date_observation').notEmpty().withMessage('La date d\'observation est requise.').isISO8601().withMessage('La date d\'observation doit être au format ISO8601 (YYYY-MM-DD).').toDate(),
        body('source_information_input').optional().isString().trim().isLength({ max: 255 })
    ];
};

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    return res.status(422).json({
        message: "Erreurs de validation.",
        errors: extractedErrors,
    });
};

module.exports = {
    searchPrixValidationRules,
    addObservationValidationRules,
    validate,
};