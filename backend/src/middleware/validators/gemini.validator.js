// backend/src/middleware/validators/gemini.validator.js (Squelette)
const { body: bodyGemini, validationResult: geminiValidationResult } = require('express-validator');

const conseilCultureRules = () => [
    bodyGemini('donneesParcelle').notEmpty().isObject().withMessage("Données de parcelle requises et doivent être un objet."),
    bodyGemini('cultureInfo').notEmpty().isObject().withMessage("Informations sur la culture requises et doivent être un objet."),
    bodyGemini('historiqueMeteoLocal').optional().isObject()
];
const optimiserRationRules = () => [
    bodyGemini('typeAnimal').notEmpty().isString(),
    bodyGemini('alimentsDisponibles').notEmpty().isArray({min:1}).withMessage("Liste d'aliments disponibles requise."),
    bodyGemini('stadeProduction').notEmpty().isString()
];
const resumerActualiteRules = () => [
    bodyGemini('texte_actualite').trim().notEmpty().isLength({min: 50, max: 10000}).withMessage("Texte d'actualité requis (50-10000 caractères).")
];

const validateGemini = (req, res, next) => { /* ... (même que validateElevage) ... */
    const errors = geminiValidationResult(req);
    if (errors.isEmpty()) return next();
    return res.status(422).json({ message: "Erreurs de validation.", errors: errors.array().map(e => ({ [e.path]: e.msg })) });
};
// module.exports = { conseilCultureRules, optimiserRationRules, resumerActualiteRules, validateGemini };

// backend/src/routes/gemini.routes.js
const expressGemini = require('express');
const routerGemini = expressGemini.Router();
const geminiController = require('../controllers/gemini.controller');
const geminiValidator = require('../middleware/validators/gemini.validator');
const { authenticateToken: authenticateTokenGemini } = require('../middleware/auth.middleware');

routerGemini.use(authenticateTokenGemini); // Toutes les routes Gemini protégées

routerGemini.post('/conseil-culture', geminiValidator.conseilCultureRules(), geminiValidator.validateGemini, geminiController.getConseilCultureIA);
routerGemini.post('/optimiser-ration', geminiValidator.optimiserRationRules(), geminiValidator.validateGemini, geminiController.optimiserRationIA);
routerGemini.post('/resumer-actualite', geminiValidator.resumerActualiteRules(), geminiValidator.validateGemini, geminiController.resumerActualiteIA);

module.exports = routerGemini; 