// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
// const { validateRegistration, validateLogin } = require('../middleware/validators/auth.validator'); // Exemple de middleware de validation

// POST /api/auth/register
router.post('/register', /* validateRegistration, */ authController.register);

// POST /api/auth/login
router.post('/login', /* validateLogin, */ authController.login);

// POST /api/auth/refresh-token (optionnel)
// router.post('/refresh-token', authController.refreshToken);

// POST /api/auth/logout (optionnel, si vous gérez des sessions ou des refresh tokens côté serveur)
// router.post('/logout', authController.logout);

module.exports = router;