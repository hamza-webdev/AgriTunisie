"use strict";

// backend/src/controllers/parcelle.controller.js
const db = require('../config/db.config');

// Créer une nouvelle parcelle
exports.createParcelle = async (req, res, next) => {
  const utilisateur_id = req.user.id; // Récupéré depuis le token JWT via authenticateToken middleware
  const {
    nom_parcelle,
    description,
    geometrie,
    superficie_calculee_ha,
    type_sol_predominant,
    culture_actuelle_id
  } = req.body;

  // --- VALIDATION DES DONNÉES D'ENTRÉE (ESSENTIEL !) ---
  // À implémenter : vérifier les types, les champs requis, le format GeoJSON pour geometrie, etc.
  if (!nom_parcelle || !geometrie) {
    return res.status(400).json({
      message: "Le nom de la parcelle et la géométrie sont requis."
    });
  }
  try {
    // Conversion de GeoJSON (string ou objet) en WKT pour PostGIS ST_GeomFromGeoJSON ou ST_GeomFromText
    // Supposons que 'geometrie' est un objet GeoJSON valide ou une chaîne GeoJSON.
    // PostGIS attend souvent une géométrie au format WKT ou GeoJSON directement avec ST_GeomFromGeoJSON.
    // Exemple avec ST_GeomFromGeoJSON (nécessite que la chaîne soit valide)
    // Si geometrie est un objet: JSON.stringify(geometrie)
    const geometrieGeoJSON = typeof geometrie === 'string' ? geometrie : JSON.stringify(geometrie);
    const query = `
            INSERT INTO parcelles (utilisateur_id, nom_parcelle, description, geometrie, superficie_calculee_ha, type_sol_predominant, culture_actuelle_id)
            VALUES ($1, $2, $3, ST_GeomFromGeoJSON($4), $5, $6, $7)
            RETURNING id, nom_parcelle, ST_AsGeoJSON(geometrie) as geometrie, superficie_calculee_ha, date_creation;
        `;
    // Note: ST_AsGeoJSON est utilisé pour retourner la géométrie au format GeoJSON.
    const values = [utilisateur_id, nom_parcelle, description, geometrieGeoJSON, superficie_calculee_ha, type_sol_predominant, culture_actuelle_id];
    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la création de la parcelle:", error);
    // Gérer les erreurs spécifiques de PostGIS (ex: géométrie invalide)
    if (error.code === 'XX000' && error.message.includes('invalid GeoJSON representation')) {
      return res.status(400).json({
        message: "Format GeoJSON invalide pour la géométrie."
      });
    }
    next(error);
  }
};

// Obtenir toutes les parcelles de l'utilisateur connecté
exports.getUserParcelles = async (req, res, next) => {
  const utilisateur_id = req.user.id;
  try {
    const query = `
            SELECT id, nom_parcelle, description, ST_AsGeoJSON(geometrie) as geometrie, superficie_calculee_ha, type_sol_predominant, culture_actuelle_id, date_creation
            FROM parcelles
            WHERE utilisateur_id = $1
            ORDER BY date_creation DESC;
        `;
    const result = await db.query(query, [utilisateur_id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des parcelles de l'utilisateur:", error);
    next(error);
  }
};

// Obtenir une parcelle spécifique par son ID
exports.getParcelleById = async (req, res, next) => {
  const {
    id
  } = req.params;
  const utilisateur_id = req.user.id; // Pour s'assurer que l'utilisateur ne récupère que ses propres parcelles

  try {
    const query = `
            SELECT id, nom_parcelle, description, ST_AsGeoJSON(geometrie) as geometrie, superficie_calculee_ha, type_sol_predominant, culture_actuelle_id, date_creation
            FROM parcelles
            WHERE id = $1 AND utilisateur_id = $2;
        `;
    const result = await db.query(query, [id, utilisateur_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Parcelle non trouvée ou accès non autorisé."
      });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération de la parcelle:", error);
    next(error);
  }
};

// Mettre à jour une parcelle spécifique
exports.updateParcelle = async (req, res, next) => {
  const {
    id
  } = req.params;
  const utilisateur_id = req.user.id;
  const {
    nom_parcelle,
    description,
    geometrie,
    superficie_calculee_ha,
    type_sol_predominant,
    culture_actuelle_id
  } = req.body;

  // --- VALIDATION DES DONNÉES D'ENTRÉE ---
  if (!nom_parcelle) {
    // Exemple minimal
    return res.status(400).json({
      message: "Le nom de la parcelle est requis."
    });
  }
  try {
    let geometrieUpdateQuery = '';
    const values = [nom_parcelle, description, superficie_calculee_ha, type_sol_predominant, culture_actuelle_id, id, utilisateur_id];
    let valueCounter = values.length;
    if (geometrie) {
      const geometrieGeoJSON = typeof geometrie === 'string' ? geometrie : JSON.stringify(geometrie);
      geometrieUpdateQuery = `, geometrie = ST_GeomFromGeoJSON($${valueCounter + 1})`;
      values.push(geometrieGeoJSON);
    }
    const query = `
            UPDATE parcelles
            SET nom_parcelle = $1, description = $2, superficie_calculee_ha = $3, type_sol_predominant = $4, culture_actuelle_id = $5 ${geometrieUpdateQuery}
            WHERE id = $${geometrie ? valueCounter : valueCounter - 1} AND utilisateur_id = $${geometrie ? valueCounter + 1 : valueCounter}
            RETURNING id, nom_parcelle, ST_AsGeoJSON(geometrie) as geometrie, date_creation;
        `; // Ajustez les index des $

    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Parcelle non trouvée ou accès non autorisé pour la mise à jour."
      });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la parcelle:", error);
    if (error.code === 'XX000' && error.message.includes('invalid GeoJSON representation')) {
      return res.status(400).json({
        message: "Format GeoJSON invalide pour la géométrie."
      });
    }
    next(error);
  }
};

// Supprimer une parcelle spécifique
exports.deleteParcelle = async (req, res, next) => {
  const {
    id
  } = req.params;
  const utilisateur_id = req.user.id;
  try {
    const query = `
            DELETE FROM parcelles
            WHERE id = $1 AND utilisateur_id = $2
            RETURNING id;
        `;
    const result = await db.query(query, [id, utilisateur_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Parcelle non trouvée ou accès non autorisé pour la suppression."
      });
    }
    res.status(200).json({
      message: "Parcelle supprimée avec succès.",
      id: result.rows[0].id
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la parcelle:", error);
    next(error);
  }
};