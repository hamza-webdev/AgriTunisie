"use strict";

// backend/src/services/gemini.service.js
const {
  GoogleGenerativeAI
} = require("@google/generative-ai"); // Nécessite npm install @google/generative-ai
const dbGeminiLog = require('../config/db.config'); // Pour logger les interactions

class GeminiService {
  constructor() {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({
          model: "gemini-1.5-flash-latest"
        }); // ou "gemini-pro"
        console.log("GeminiService: Initialisé avec succès.");
      } catch (e) {
        console.error("GeminiService: Erreur lors de l'initialisation de GoogleGenerativeAI. Vérifiez la clé API.", e);
        this.model = null; // Assurer que le modèle est null si l'init échoue
      }
    } else {
      console.warn("GeminiService: Clé API GEMINI_API_KEY manquante. Le service fonctionnera en mode simulé.");
      this.model = null;
    }
  }
  async _logInteraction(utilisateur_id, type_requete, prompt, reponse, paramsEntree, succes, erreurMsg = null, dureeMs = null) {
    try {
      await dbGeminiLog.query(`INSERT INTO logs_interactions_gemini 
                    (utilisateur_id, type_requete_gemini, prompt_envoye, reponse_recue, parametres_entree_json, succes_appel, erreur_message, duree_appel_ms) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [utilisateur_id, type_requete, prompt ? prompt.substring(0, 5000) : null, reponse ? JSON.stringify(reponse).substring(0, 5000) : null, paramsEntree, succes, erreurMsg, dureeMs]);
    } catch (logError) {
      console.error("Erreur lors du logging de l'interaction Gemini:", logError);
    }
  }
  async getConseilCulture(utilisateur_id, donneesParcelle, cultureInfo, historiqueMeteoLocal) {
    const startTime = Date.now();
    const prompt = `
            Agissant en tant qu'expert agronome pour la Tunisie, fournissez des conseils de culture détaillés et pratiques.
            Localisation approximative de la parcelle (si disponible dans donneesParcelle.localisation_approximative): ${donneesParcelle.localisation_approximative || 'Non fournie'}.
            Type de sol (si disponible dans donneesParcelle.type_sol): ${donneesParcelle.type_sol_predominant || 'Non fourni'}.
            Superficie (si disponible dans donneesParcelle.superficie_ha): ${donneesParcelle.superficie_calculee_ha || 'Non fournie'} ha.
            Culture envisagée: ${cultureInfo.nom_culture || 'Non spécifiée'}.
            Description de la culture: ${cultureInfo.description_generale || 'Non fournie'}.
            Historique météo récent (si disponible): ${historiqueMeteoLocal ? JSON.stringify(historiqueMeteoLocal).substring(0, 300) + '...' : 'Non fourni'}.

            Conseils attendus (soyez spécifique et donnez des exemples si possible) :
            1.  Préparation du sol : Techniques, profondeur de labour, amendements nécessaires.
            2.  Période de semis/plantation optimale pour la région (si connue) et la culture.
            3.  Fertilisation : Type d'engrais (organique, minéral), quantités indicatives par hectare, périodes d'application.
            4.  Irrigation : Besoins estimés, fréquence, techniques recommandées.
            5.  Gestion des maladies et nuisibles courants pour cette culture en Tunisie : méthodes préventives et curatives (privilégier bio si possible).
            6.  Rotation des cultures : Suggestions de cultures précédentes/suivantes.
            Répondez en français.
        `;
    if (!this.model) {
      console.warn("GeminiService (conseilCulture): Mode simulé activé.");
      await this._logInteraction(utilisateur_id, 'conseil_culture', prompt, {
        conseil: "Simulation: Vérifiez le pH du sol."
      }, {
        donneesParcelle,
        cultureInfo
      }, true, null, Date.now() - startTime);
      return {
        conseil: "Conseil de culture simulé par l'IA : Assurez un bon drainage et une fertilisation NPK équilibrée. Pensez à la rotation des cultures."
      };
    }
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      await this._logInteraction(utilisateur_id, 'conseil_culture', prompt, {
        conseil: text
      }, {
        donneesParcelle,
        cultureInfo
      }, true, null, Date.now() - startTime);
      return {
        conseil: text
      };
    } catch (error) {
      console.error("Erreur API Gemini (conseil culture):", error);
      await this._logInteraction(utilisateur_id, 'conseil_culture', prompt, null, {
        donneesParcelle,
        cultureInfo
      }, false, error.message, Date.now() - startTime);
      throw {
        status: 500,
        message: "Erreur lors de la génération du conseil par l'IA."
      };
    }
  }
  async optimiserRationAnimale(utilisateur_id, typeAnimal, alimentsDisponibles, stadeProduction, objectifs = "maintien et production standard") {
    const startTime = Date.now();
    const prompt = `
            En tant qu'expert en nutrition animale pour des conditions tunisiennes, proposez une ration alimentaire optimisée.
            Type d'animal : ${typeAnimal}.
            Stade de production / physiologique : ${stadeProduction}.
            Objectifs spécifiques (optionnel) : ${objectifs}.
            Aliments disponibles localement (avec quantités approximatives si possible) : ${JSON.stringify(alimentsDisponibles)}.
            
            Votre réponse doit inclure :
            1.  Une proposition de ration journalière équilibrée (quantités par aliment).
            2.  Une estimation des apports nutritionnels clés (ex: UFL, PDIN, PDIE pour ruminants; Énergie Métabolisable, Protéines Brutes pour monogastriques).
            3.  Des recommandations pratiques pour la distribution et l'abreuvement.
            4.  Des signaux d'alerte si la ration proposée est carencée ou excédentaire pour certains nutriments critiques.
            Répondez en français.
        `;
    if (!this.model) {
      console.warn("GeminiService (optimiserRation): Mode simulé activé.");
      await this._logInteraction(utilisateur_id, 'optimiser_ration', prompt, {
        ration: "Simulation: Foin à volonté, complémentation modérée."
      }, {
        typeAnimal,
        alimentsDisponibles,
        stadeProduction
      }, true, null, Date.now() - startTime);
      return {
        ration_suggeree: "Ration optimisée simulée : 60% fourrage de bonne qualité, 30% concentré énergétique et protéique, 10% compléments minéraux et vitaminiques. Eau propre et fraîche à volonté."
      };
    }
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      await this._logInteraction(utilisateur_id, 'optimiser_ration', prompt, {
        ration_suggeree: text
      }, {
        typeAnimal,
        alimentsDisponibles,
        stadeProduction
      }, true, null, Date.now() - startTime);
      return {
        ration_suggeree: text
      };
    } catch (error) {
      console.error("Erreur API Gemini (optimiser ration):", error);
      await this._logInteraction(utilisateur_id, 'optimiser_ration', prompt, null, {
        typeAnimal,
        alimentsDisponibles,
        stadeProduction
      }, false, error.message, Date.now() - startTime);
      throw {
        status: 500,
        message: "Erreur lors de l'optimisation de la ration par l'IA."
      };
    }
  }
  async resumerTexteActualite(utilisateur_id, texte) {
    const startTime = Date.now();
    if (!texte || texte.trim().length < 50) {
      await this._logInteraction(utilisateur_id, 'resumer_actualite', texte, null, {
        texteLength: texte?.length
      }, false, "Texte trop court.", Date.now() - startTime);
      throw {
        status: 400,
        message: "Texte trop court pour être résumé."
      };
    }
    const prompt = `Vous êtes un assistant chargé de résumer des actualités agricoles pour des agriculteurs tunisiens. Résumez le texte suivant en français, en mettant en évidence les 2-3 points les plus importants et les implications pratiques pour un agriculteur. Soyez concis et clair.\n\nTexte à résumer:\n"""${texte}\n"""`;
    if (!this.model) {
      console.warn("GeminiService (resumerActualite): Mode simulé activé.");
      await this._logInteraction(utilisateur_id, 'resumer_actualite', prompt, {
        resume: "Simulation: Nouvelles mesures gouvernementales impactant les subventions."
      }, {
        texteLength: texte.length
      }, true, null, Date.now() - startTime);
      return {
        resume: "Résumé simulé: 1. Annonce de nouvelles subventions pour les semences certifiées. 2. Rappel des dates limites pour les déclarations de récolte. 3. Alerte sur une nouvelle maladie affectant les agrumes dans certaines régions."
      };
    }
    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      await this._logInteraction(utilisateur_id, 'resumer_actualite', prompt, {
        resume: responseText
      }, {
        texteLength: texte.length
      }, true, null, Date.now() - startTime);
      return {
        resume: responseText
      };
    } catch (error) {
      console.error("Erreur API Gemini (résumé actualité):", error);
      await this._logInteraction(utilisateur_id, 'resumer_actualite', prompt, null, {
        texteLength: texte.length
      }, false, error.message, Date.now() - startTime);
      throw {
        status: 500,
        message: "Erreur lors du résumé du texte par l'IA."
      };
    }
  }
}
module.exports = new GeminiService();