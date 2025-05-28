// backend/src/middleware/validators/meteo.validator.js
const { query, validationResult: meteoValidationResult } = require('express-validator');

const previsionsMeteoValidationRules = () => [
    query('latitude').notEmpty().withMessage('La latitude est requise.').isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide.'),
    query('longitude').notEmpty().withMessage('La longitude est requise.').isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide.'),
    query('units').optional().isIn(['metric', 'imperial']).withMessage("L'unité doit être 'metric' ou 'imperial'.")
];

const historiqueMeteoValidationRules = () => [
    query('latitude').notEmpty().withMessage('La latitude est requise.').isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide.'),
    query('longitude').notEmpty().withMessage('La longitude est requise.').isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide.'),
    query('dateStart').notEmpty().withMessage('La date de début est requise.').isISO8601().withMessage('La date de début doit être au format YYYY-MM-DD.'),
    query('dateEnd').notEmpty().withMessage('La date de fin est requise.').isISO8601().withMessage('La date de fin doit être au format YYYY-MM-DD.')
        .custom((value, { req }) => {
            if (req.query.dateStart && new Date(value) < new Date(req.query.dateStart)) {
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
module.exports = { previsionsMeteoValidationRules, historiqueMeteoValidationRules, validateMeteo };
