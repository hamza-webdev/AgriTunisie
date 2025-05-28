// backend/src/services/meteo.service.js
class MeteoService {
    /**
     * Récupère les prévisions météo pour une localisation donnée.
     * Cela impliquerait un appel à une API météo externe (ex: OpenWeatherMap).
     * @param {number} latitude
     * @param {number} longitude
     * @param {string} units - 'metric' ou 'imperial'
     * @returns {Promise<object>} - Données de prévision.
     */
    async getPrevisions(latitude, longitude, units = 'metric') {
        // SIMULATION d'un appel API externe
        // Dans une vraie application, utilisez 'axios' ou 'node-fetch' pour appeler une API météo.
        // Exemple: const apiKey = process.env.OPENWEATHERMAP_API_KEY;
        // const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${units}&appid=${apiKey}&lang=fr`;
        // const response = await axios.get(url);
        // return response.data;

        console.log(`MeteoService: Appel simulé pour prévisions à lat ${latitude}, lon ${longitude}`);
        // Données de simulation
        return Promise.resolve({
            message: "Prévisions météo simulées",
            latitude,
            longitude,
            units,
            forecast: [
                { date: "2025-05-29", temp_min: 15, temp_max: 25, description: "Ensoleillé", icon: "01d" },
                { date: "2025-05-30", temp_min: 16, temp_max: 26, description: "Partiellement nuageux", icon: "02d" },
            ],
            // Potentiellement, mettre en cache les résultats ici dans `donnees_meteo_cache`
        });
    }

    /**
     * Récupère l'historique météo pour une localisation et une période.
     * @param {number} latitude
     * @param {number} longitude
     * @param {string} dateStart - YYYY-MM-DD
     * @param {string} dateEnd - YYYY-MM-DD
     * @returns {Promise<object>} - Données historiques.
     */
    async getHistorique(latitude, longitude, dateStart, dateEnd) {
        // SIMULATION - Une API historique est souvent un service payant ou plus complexe.
        // Pourrait aussi lire depuis `donnees_meteo_cache` si peuplée régulièrement.
        console.log(`MeteoService: Appel simulé pour historique à lat ${latitude}, lon ${longitude} de ${dateStart} à ${dateEnd}`);
        return Promise.resolve({
            message: "Historique météo simulé",
            latitude,
            longitude,
            dateStart,
            dateEnd,
            data: [
                { date: "2025-05-01", temp_avg: 20, precipitation_mm: 0 },
            ]
        });
    }
}
module.exports = new MeteoService();