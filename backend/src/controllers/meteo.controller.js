// backend/src/controllers/meteo.controller.js
const meteoServiceInstance = new (require('../services/meteo.service'))(); // Simule l'export/import

exports.getPrevisionsMeteo = async (req, res, next) => {
    const { latitude, longitude, units } = req.query; // Validés par le middleware
    try {
        const previsions = await meteoServiceInstance.getPrevisions(parseFloat(latitude), parseFloat(longitude), units);
        res.status(200).json(previsions);
    } catch (error) {
        console.error("Erreur contrôleur getPrevisionsMeteo:", error.message);
        // Gérer les erreurs spécifiques de l'API externe si nécessaire
        if (error.response && error.response.status) { // Erreur Axios par exemple
            return res.status(error.response.status).json({ message: error.response.data.message || "Erreur de l'API météo externe." });
        }
        next(error);
    }
};

exports.getHistoriqueMeteo = async (req, res, next) => {
    const { latitude, longitude, dateStart, dateEnd } = req.query; // Validés
    try {
        const historique = await meteoServiceInstance.getHistorique(parseFloat(latitude), parseFloat(longitude), dateStart, dateEnd);
        res.status(200).json(historique);
    } catch (error) {
        console.error("Erreur contrôleur getHistoriqueMeteo:", error.message);
        next(error);
    }
};