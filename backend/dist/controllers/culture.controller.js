"use strict";

// backend/src/controllers/culture.controller.js
const cultureService = require('../services/culture.service');
exports.getAllCultures = async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  try {
    const result = await cultureService.getAll({
      page,
      limit
    });
    res.status(200).json(result);
  } catch (error) {
    // Pas besoin de logguer ici si déjà fait dans le service
    next(error); // Transmet à la gestion d'erreur globale
  }
};
exports.getCultureById = async (req, res, next) => {
  const {
    id
  } = req.params; // Supposons que l'ID est validé par un middleware
  try {
    const culture = await cultureService.getById(id);
    if (!culture) {
      return res.status(404).json({
        message: "Culture non trouvée dans le catalogue."
      });
    }
    res.status(200).json(culture);
  } catch (error) {
    next(error);
  }
};