// backend/src/controllers/meteo.controller.js
const meteoServiceInstance = new (require('../services/meteo.service'))(); // Simule l'export/import

exports.getPrevisionsMeteo = async (req, res, next) => {
    const { latitude, longitude, units } = req.query; // Validés par le middleware
    try {
        const previsions = await meteoServiceInstance.getPrevisions(parseFloat(latitude), parseFloat(longitude), units);
        res.status(200).json(previsions);
    } catch (error) {
        // Les erreurs spécifiques (401, 503) sont déjà gérées par le service
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        console.error("Erreur contrôleur getPrevisionsMeteo:", error.message);
        next(error); // Pour les erreurs inattendues
    }
};

exports.getHistoriqueMeteo = async (req, res, next) => {
    const { latitude, longitude, dateStart, dateEnd } = req.query; // Validés
    try {
        const historique = await meteoServiceInstance.getHistorique(parseFloat(latitude), parseFloat(longitude), dateStart, dateEnd);
        res.status(200).json(historique);
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        console.error("Erreur contrôleur getHistoriqueMeteo:", error.message);
        next(error);
    }
};