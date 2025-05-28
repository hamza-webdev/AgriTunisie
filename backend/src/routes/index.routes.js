// backend/src/routes/index.routes.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const parcelleRoutes = require('./parcelle.routes');
const cultureRoutes = require('./culture.routes');
const prixRoutes = require('./prix.routes');
// const userRoutes = require('./user.routes'); // Si vous créez des routes spécifiques pour la gestion des utilisateurs
// ... autres routes

router.use('/auth', authRoutes);
router.use('/parcelles', parcelleRoutes);
router.use('/cultures', cultureRoutes); // Pour le catalogue des cultures
router.use('/prix', prixRoutes); // Pour la bourse des prix
// router.use('/users', userRoutes);
// ...

module.exports = router;