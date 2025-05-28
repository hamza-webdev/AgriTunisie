// backend/src/middleware/validators/culture.validator.js
const { param, validationResult } = require('express-validator');

const cultureIdValidationRules = () => {
    return [
        param('id').isInt({ min: 1 }).withMessage('L\'ID de la culture doit être un entier positif.').toInt()
    ];
};

// Si vous ajoutez des routes de création/mise à jour pour les admins :
// const cultureDataValidationRules = () => {
//     return [
//         body('nom_culture').trim().notEmpty().withMessage('Le nom de la culture est requis.'),
//         // ... autres règles pour les champs de la culture
//     ];
// };

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
    cultureIdValidationRules,
    // cultureDataValidationRules,
    validate,
};