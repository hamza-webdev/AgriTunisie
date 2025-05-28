// backend/src/routes/index.routes.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const parcelleRoutes = require('./parcelle.routes');
const cultureRoutes = require('./culture.routes');
const prixRoutes = require('./prix.routes');
const meteoRoutes = require('./meteo.routes'); // NOUVEAU
const elevageRoutes = require('./elevage.routes'); // NOUVEAU
const communauteRoutes = require('./communaute.routes'); // NOUVEAU
const geminiRoutes = require('./gemini.routes'); // NOUVEAU
// const userRoutes = require('./user.routes'); // Si vous créez des routes spécifiques pour la gestion des utilisateurs
// ... autres routes

router.use('/auth', authRoutes);
router.use('/parcelles', parcelleRoutes);
router.use('/cultures', cultureRoutes); // Pour le catalogue des cultures
router.use('/prix', prixRoutes); // Pour la bourse des prix
router.use('/meteo', meteoRoutes); // NOUVEAU
router.use('/elevage', elevageRoutes); // NOUVEAU
router.use('/communaute', communauteRoutes); // NOUVEAU
router.use('/gemini', geminiRoutes); // NOUVEAU
// router.use('/users', userRoutes);
// ...

module.exports = router;