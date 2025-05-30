"use strict";

// backend/src/routes/auth.routes.js
const expressAuth = require('express');
const routerAuth = expressAuth.Router();
const authController = require('../controllers/auth.controller'); // Assurez-vous que le chemin est correct
const authValidator = require('../middleware/validators/auth.validator'); // Assurez-vous que le chemin est correct

routerAuth.post('/register', authValidator.registerValidationRules(), authValidator.validateAuth, authController.register);
routerAuth.post('/login', authValidator.loginValidationRules(), authValidator.validateAuth, authController.login);
module.exports = routerAuth; // Sera utilisé dans index.routes.js