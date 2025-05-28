// backend/src/controllers/prix.controller.js
const prixService = require('../services/prix.service');

exports.searchPrixObservations = async (req, res, next) => {
    const { produitId, regionId, dateStart, dateEnd, marcheNom } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const filters = {
        produitId: produitId ? parseInt(produitId, 10) : undefined,
        regionId: regionId ? parseInt(regionId, 10) : undefined,
        dateStart, // La validation du format de date serait dans le validateur
        dateEnd,
        marcheNom
    };

    try {
        const result = await prixService.searchObservations(filters, { page, limit });
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

exports.addPrixObservation = async (req, res, next) => {
    // req.user est disponible grâce à authenticateToken et authorizeRole middlewares
    try {
        const observation = await prixService.addObservation(req.body, req.user);
        res.status(201).json(observation);
    } catch (error) {
        if (error.status) { // Erreur personnalisée du service
            return res.status(error.status).json({ message: error.message });
        }
        next(error);
    }
};

exports.getAllProduits = async (req, res, next) => {
    try {
        const produits = await prixService.getAllProduits();
        res.status(200).json(produits);
    } catch (error) {
        next(error);
    }
};

exports.getAllRegions = async (req, res, next) => {
    try {
        const regions = await prixService.getAllRegions();
        res.status(200).json(regions);
    } catch (error) {
        next(error);
    }
};