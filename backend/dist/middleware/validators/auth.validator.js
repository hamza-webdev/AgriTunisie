"use strict";

// backend/src/middleware/validators/auth.validator.js
const {
  body,
  validationResult: authValidationResult
} = require('express-validator'); // Assurez-vous d'avoir fait 'npm install express-validator'

const registerValidationRules = () => [body('nom_complet').trim().notEmpty().withMessage('Le nom complet est requis.').isLength({
  min: 3
}).withMessage('Le nom complet doit contenir au moins 3 caractères.'), body('email').isEmail().withMessage('Veuillez fournir une adresse email valide.').normalizeEmail(), body('mot_de_passe').isLength({
  min: 6
}).withMessage('Le mot de passe doit contenir au moins 6 caractères.'), body('numero_telephone').optional({
  checkFalsy: true
}).isMobilePhone('ar-TN').withMessage('Numéro de téléphone invalide pour la Tunisie.') // Exemple pour la Tunisie
];
const loginValidationRules = () => [body('email').isEmail().withMessage('Veuillez fournir une adresse email valide.').normalizeEmail(), body('mot_de_passe').notEmpty().withMessage('Le mot de passe est requis.')];
const validateAuth = (req, res, next) => {
  const errors = authValidationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = errors.array().map(err => ({
    [err.path]: err.msg
  }));
  return res.status(422).json({
    message: "Erreurs de validation.",
    errors: extractedErrors
  });
};
module.exports = {
  registerValidationRules,
  loginValidationRules,
  validateAuth
}; // Sera utilisé dans auth.routes.js