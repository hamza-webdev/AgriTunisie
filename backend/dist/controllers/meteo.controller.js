"use strict";

// backend/src/controllers/meteo.controller.js
const meteoServiceInstance = require('../services/meteo.service');
//const meteoServiceInstance = new MeteoService(); // Utilisation directe pour l'exemple

exports.getPrevisionsMeteo = async (req, res, next) => {
  const {
    latitude,
    longitude,
    units
  } = req.query;
  try {
    const previsions = await meteoServiceInstance.getPrevisions(parseFloat(latitude), parseFloat(longitude), units);
    res.status(200).json(previsions);
  } catch (error) {
    if (error.status) return res.status(error.status).json({
      message: error.message
    });
    next(error);
  }
};
exports.getHistoriqueMeteo = async (req, res, next) => {
  const {
    latitude,
    longitude,
    dateStart,
    dateEnd
  } = req.query;
  try {
    const historique = await meteoServiceInstance.getHistorique(parseFloat(latitude), parseFloat(longitude), dateStart, dateEnd);
    res.status(200).json(historique);
  } catch (error) {
    if (error.status) return res.status(error.status).json({
      message: error.message
    });
    next(error);
  }
};