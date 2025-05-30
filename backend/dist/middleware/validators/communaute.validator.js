"use strict";

// backend/src/middleware/validators/communaute.validator.js (Squelette)
const {
  body: bodyComm,
  param: paramComm,
  query: queryComm,
  validationResult: commValidationResult
} = require('express-validator');
const createPostRules = () => [bodyComm('categorie_id').notEmpty().isInt({
  min: 1
}), bodyComm('titre_post').trim().notEmpty().isLength({
  min: 5,
  max: 255
}), bodyComm('contenu_post').trim().notEmpty().isLength({
  min: 10
})];
const addCommentRules = () => [bodyComm('contenu_commentaire').trim().notEmpty().isLength({
  min: 1
})];
const idParamRules = paramName => [paramComm(paramName).isInt({
  min: 1
})];
const paginationRulesComm = () => [queryComm('page').optional().isInt({
  min: 1
}).toInt(), queryComm('limit').optional().isInt({
  min: 1,
  max: 50
}).toInt()];
const validateComm = (req, res, next) => {
  /* ... (même que validateElevage) ... */
  const errors = commValidationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(422).json({
    message: "Erreurs de validation.",
    errors: errors.array().map(e => ({
      [e.path]: e.msg
    }))
  });
};
module.exports = {
  createPostRules,
  addCommentRules,
  idParamRules,
  paginationRulesComm,
  validateComm
};