"use strict";

// backend/src/controllers/gemini.controller.js
const geminiServiceInstance = new (require('../services/gemini.service'))();
// Simuler db pour log (dans une vraie app, ce serait le service db)
const dbLogGemini = {
  query: (q, v) => console.log("DB LOG GEMINI:", q, v)
};
exports.getConseilCultureIA = async (req, res, next) => {
  const utilisateur_id = req.user.id;
  // Supposons que req.body contient { donneesParcelle, cultureInfo, historiqueMeteoLocal }
  // Ces données pourraient être récupérées par d'autres services avant d'appeler celui-ci.
  const {
    donneesParcelle,
    cultureInfo,
    historiqueMeteoLocal
  } = req.body;

  // Validation basique
  if (!donneesParcelle || !cultureInfo) {
    return res.status(400).json({
      message: "Données de parcelle et informations sur la culture requises."
    });
  }
  try {
    const resultat = await geminiServiceInstance.getConseilCulture(donneesParcelle, cultureInfo, historiqueMeteoLocal);
    // Log l'interaction
    await dbLogGemini.query('INSERT INTO logs_interactions_gemini (utilisateur_id, type_requete_gemini, prompt_envoye, reponse_recue, succes_appel) VALUES ($1, $2, $3, $4, $5)', [utilisateur_id, 'conseil_culture', 'Prompt simulé...', JSON.stringify(resultat), true]);
    res.json(resultat);
  } catch (error) {
    await dbLogGemini.query('INSERT INTO logs_interactions_gemini (utilisateur_id, type_requete_gemini, prompt_envoye, erreur_message, succes_appel) VALUES ($1, $2, $3, $4, $5)', [utilisateur_id, 'conseil_culture', 'Prompt simulé...', error.message, false]);
    if (error.status) return res.status(error.status).json({
      message: error.message
    });
    next(error);
  }
};
exports.optimiserRationIA = async (req, res, next) => {
  const utilisateur_id = req.user.id;
  const {
    typeAnimal,
    alimentsDisponibles,
    stadeProduction
  } = req.body;
  if (!typeAnimal || !alimentsDisponibles || !stadeProduction) {
    return res.status(400).json({
      message: "Type d'animal, aliments disponibles et stade de production requis."
    });
  }
  try {
    const resultat = await geminiServiceInstance.optimiserRationAnimale(typeAnimal, alimentsDisponibles, stadeProduction);
    // Log
    res.json(resultat);
  } catch (error) {
    // Log erreur
    if (error.status) return res.status(error.status).json({
      message: error.message
    });
    next(error);
  }
};
exports.resumerActualiteIA = async (req, res, next) => {
  const utilisateur_id = req.user.id;
  const {
    texte_actualite
  } = req.body;
  if (!texte_actualite || texte_actualite.trim().length < 50) {
    // Validation du contrôleur
    return res.status(400).json({
      message: "Le texte de l'actualité est requis et doit contenir au moins 50 caractères."
    });
  }
  try {
    const resultat = await geminiServiceInstance.resumerTexteActualite(texte_actualite);
    // Log
    res.json(resultat);
  } catch (error) {
    // Log erreur
    if (error.status) return res.status(error.status).json({
      message: error.message
    });
    next(error);
  }
};