"use strict";

// backend/src/controllers/parcelle.controller.js
const parcelleService = require('../services/parcelle.service');
exports.createParcelle = async (req, res, next) => {
  const utilisateur_id = req.user.id;
  try {
    const parcelle = await parcelleService.create(utilisateur_id, req.body);
    res.status(201).json(parcelle);
  } catch (error) {
    if (error.status) {
      // Erreur personnalisée du service
      return res.status(error.status).json({
        message: error.message
      });
    }
    console.error("Erreur contrôleur createParcelle:", error);
    next(error); // Passe à la gestion d'erreur globale pour les erreurs inattendues
  }
};
exports.getUserParcelles = async (req, res, next) => {
  const utilisateur_id = req.user.id;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  try {
    const result = await parcelleService.findByUserId(utilisateur_id, {
      page,
      limit
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur contrôleur getUserParcelles:", error);
    next(error);
  }
};
exports.getParcelleById = async (req, res, next) => {
  const {
    id
  } = req.params; // L'ID est déjà validé (entier) par le middleware
  const utilisateur_id = req.user.id;
  try {
    const parcelle = await parcelleService.findByIdAndUserId(id, utilisateur_id);
    if (!parcelle) {
      return res.status(404).json({
        message: "Parcelle non trouvée ou accès non autorisé."
      });
    }
    res.status(200).json(parcelle);
  } catch (error) {
    console.error("Erreur contrôleur getParcelleById:", error);
    next(error);
  }
};
exports.updateParcelle = async (req, res, next) => {
  const {
    id
  } = req.params;
  const utilisateur_id = req.user.id;
  try {
    // Vérifier d'abord si la parcelle existe et appartient à l'utilisateur (peut être fait dans le service)
    const existingParcelle = await parcelleService.findByIdAndUserId(id, utilisateur_id);
    if (!existingParcelle) {
      return res.status(404).json({
        message: "Parcelle non trouvée ou accès non autorisé pour la mise à jour."
      });
    }
    const parcelleMiseAJour = await parcelleService.update(id, utilisateur_id, req.body);
    if (!parcelleMiseAJour) {
      // Redondant si vérifié avant, mais bonne sécurité
      return res.status(404).json({
        message: "Mise à jour échouée, parcelle non trouvée ou accès non autorisé."
      });
    }
    res.status(200).json(parcelleMiseAJour);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        message: error.message
      });
    }
    console.error("Erreur contrôleur updateParcelle:", error);
    next(error);
  }
};
exports.deleteParcelle = async (req, res, next) => {
  const {
    id
  } = req.params;
  const utilisateur_id = req.user.id;
  try {
    const deleted = await parcelleService.delete(id, utilisateur_id);
    if (!deleted) {
      return res.status(404).json({
        message: "Parcelle non trouvée ou accès non autorisé pour la suppression."
      });
    }
    res.status(200).json({
      message: "Parcelle supprimée avec succès."
    });
  } catch (error) {
    console.error("Erreur contrôleur deleteParcelle:", error);
    next(error);
  }
};