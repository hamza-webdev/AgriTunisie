// backend/src/middleware/validators/meteo.validator.js
const { query: queryMeteo, validationResult: meteoValidationResult } = require('express-validator');

const previsionsMeteoValidationRules = () => [ /* ... (comme précédemment) ... */ 
    queryMeteo('latitude').notEmpty().isFloat({ min: -90, max: 90 }),
    queryMeteo('longitude').notEmpty().isFloat({ min: -180, max: 180 }),
    queryMeteo('units').optional().isIn(['metric', 'imperial'])
];
const historiqueMeteoValidationRules = () => [  /* ... (comme précédemment) ... */ 
    queryMeteo('latitude').notEmpty().isFloat({ min: -90, max: 90 }),
    queryMeteo('longitude').notEmpty().isFloat({ min: -180, max: 180 }),
    queryMeteo('dateStart').notEmpty().isISO8601(),
    queryMeteo('dateEnd').notEmpty().isISO8601().custom((value, { req }) => { if (new Date(value) < new Date(req.query.dateStart)) throw new Error('Date de fin antérieure.'); return true; })
];
const validateMeteo = (req, res, next) => { /* ... (comme précédemment) ... */ 
    const errors = meteoValidationResult(req);
    if (errors.isEmpty()) return next();
    return res.status(422).json({ message: "Erreurs validation météo.", errors: errors.array().map(err => ({ [err.path]: err.msg })) });
};
module.exports = { previsionsMeteoValidationRules, historiqueMeteoValidationRules, validateMeteo };
