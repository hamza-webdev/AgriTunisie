// backend/src/middleware/validators/parcelle.validator.js
const { body, param, validationResult } = require('express-validator');

const validateGeoJSON = (value) => {
    // Ceci est une validation GeoJSON TRES basique.
    // Pour une validation robuste, envisagez d'utiliser une librairie spécialisée comme 'geojson-validation'.
    if (typeof value !== 'object' || value === null) {
        throw new Error('La géométrie doit être un objet GeoJSON.');
    }
    if (!value.type || !value.coordinates) {
        throw new Error('L\'objet GeoJSON doit avoir les propriétés "type" et "coordinates".');
    }
    // Ajoutez d'autres vérifications si nécessaire (ex: type 'Polygon', structure des coordonnées)
    if (value.type !== 'Polygon' && value.type !== 'MultiPolygon') { // Adaptez selon vos besoins
        throw new Error('Le type de géométrie doit être Polygon ou MultiPolygon.');
    }
    // Vérifier la structure des coordonnées pour un Polygon (simplifié)
    if (value.type === 'Polygon') {
        if (!Array.isArray(value.coordinates) || value.coordinates.length === 0) {
            throw new Error('Les coordonnées du Polygon doivent être un tableau de rings.');
        }
        value.coordinates.forEach(ring => {
            if (!Array.isArray(ring) || ring.length < 4) { // Un ring doit avoir au moins 4 points (3 distincts + fermeture)
                throw new Error('Chaque ring du Polygon doit être un tableau d\'au moins 4 coordonnées.');
            }
            ring.forEach(point => {
                if (!Array.isArray(point) || point.length !== 2 || typeof point[0] !== 'number' || typeof point[1] !== 'number') {
                    throw new Error('Chaque coordonnée doit être un tableau de deux nombres [longitude, latitude].');
                }
            });
            // Vérifier que le premier et le dernier point du ring sont identiques
            const firstPoint = ring[0];
            const lastPoint = ring[ring.length - 1];
            if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
                throw new Error('Le premier et le dernier point de chaque ring du Polygon doivent être identiques.');
            }
        });
    }
    return true;
};


const parcelleValidationRules = () => {
    return [
        body('nom_parcelle')
            .trim()
            .notEmpty().withMessage('Le nom de la parcelle est requis.')
            .isString().withMessage('Le nom de la parcelle doit être une chaîne de caractères.')
            .isLength({ min: 3, max: 255 }).withMessage('Le nom de la parcelle doit contenir entre 3 et 255 caractères.'),
        body('description')
            .optional({ checkFalsy: true }) // Permet une chaîne vide ou null
            .trim()
            .isString().withMessage('La description doit être une chaîne de caractères.'),
        body('geometrie')
            .notEmpty().withMessage('La géométrie de la parcelle est requise.')
            .custom(validateGeoJSON), // Validation personnalisée pour GeoJSON
        body('superficie_calculee_ha')
            .optional({ checkFalsy: true })
            .isNumeric().withMessage('La superficie doit être un nombre.')
            .toFloat(),
        body('type_sol_predominant')
            .optional({ checkFalsy: true })
            .trim()
            .isString().withMessage('Le type de sol doit être une chaîne de caractères.')
            .isLength({ max: 100 }).withMessage('Le type de sol ne doit pas dépasser 100 caractères.'),
        body('culture_actuelle_id')
            .optional({ checkFalsy: true })
            .isInt({ min: 1 }).withMessage('L\'ID de la culture actuelle doit être un entier positif.')
            .toInt()
    ];
};

const parcelleIdValidationRules = () => {
    return [
        param('id').isInt({ min: 1 }).withMessage('L\'ID de la parcelle doit être un entier positif.').toInt()
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
    parcelleValidationRules,
    parcelleIdValidationRules,
    validate,
};