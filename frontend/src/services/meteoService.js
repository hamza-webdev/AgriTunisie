// frontend/src/services/meteoService.js
import { apiService } from './apiService'; // Corrected path if apiService is in the same directory

/**
 * Récupère les prévisions météo pour une localisation donnée.
 * @param {number} latitude - La latitude de la localisation.
 * @param {number} longitude - La longitude de la localisation.
 * @param {string} [units='metric'] - Les unités souhaitées ('metric' ou 'imperial').
 * @returns {Promise<object>} - Les données des prévisions météo.
 */
export const getPrevisions = async (latitude, longitude, units = 'metric') => {
    if (latitude == null || longitude == null) {
        throw new Error("Latitude and longitude are required for weather forecasts.");
    }
    const endpoint = `/meteo/previsions?latitude=${latitude}&longitude=${longitude}&units=${units}`;
    return apiService.get(endpoint);
};

/**
 * Récupère l'historique météo pour une localisation et une période données.
 * @param {number} latitude - La latitude de la localisation.
 * @param {number} longitude - La longitude de la localisation.
 * @param {string} dateStart - La date de début de la période (YYYY-MM-DD).
 * @param {string} dateEnd - La date de fin de la période (YYYY-MM-DD).
 * @returns {Promise<object>} - Les données de l'historique météo.
 */
export const getHistorique = async (latitude, longitude, dateStart, dateEnd) => {
    if (latitude == null || longitude == null || !dateStart || !dateEnd) {
        throw new Error("Latitude, longitude, dateStart, and dateEnd are required for historical weather data.");
    }
    const endpoint = `/meteo/historique?latitude=${latitude}&longitude=${longitude}&dateStart=${dateStart}&dateEnd=${dateEnd}`;
    return apiService.get(endpoint);
};
