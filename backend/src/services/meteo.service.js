// backend/src/services/meteo.service.js
// Assurez-vous d'installer axios: npm install axios
const axios = require('axios'); 
const dbMeteo = require('../config/db.config'); // Pour le cache

class MeteoService {
    /**
     * Récupère les prévisions météo pour une localisation donnée.
     * Utilise OpenWeatherMap et met en cache les résultats.
     * @param {number} latitude
     * @param {number} longitude
     * @param {string} units - 'metric' ou 'imperial'
     * @returns {Promise<object>} - Données de prévision.
     */
    async getPrevisions(latitude, longitude, units = 'metric') {
        const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
        if (!OPENWEATHERMAP_API_KEY) {
            console.error("MeteoService: Clé API OpenWeatherMap manquante (OPENWEATHERMAP_API_KEY).");
            // Pourrait retourner des données de simulation ou lever une erreur plus spécifique
            // throw { status: 500, message: "Configuration du service météo incomplète." };
             return Promise.resolve({ // Retourner des données de simulation si la clé est manquante pour le développement
                message: "Prévisions météo simulées (Clé API manquante)",
                latitude, longitude, units,
                forecast: [{ date: "2025-01-01", temp_min: 10, temp_max: 20, description: "Simulation", icon: "01d" }]
            });
        }

        const lang = 'fr'; // Langue pour les descriptions
        // API OpenWeatherMap pour les prévisions sur 5 jours / 3 heures
        // Note: L'API "One Call" est souvent préférée mais peut avoir des plans tarifaires différents.
        // L'endpoint /forecast donne des prévisions par tranches de 3h.
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${units}&appid=${OPENWEATHERMAP_API_KEY}&lang=${lang}`;

        try {
            console.log(`MeteoService: Appel à OpenWeatherMap pour prévisions à lat ${latitude}, lon ${longitude}`);
            const response = await axios.get(url);
            
            // Transformer les données pour un format plus simple si nécessaire
            // Ici, nous allons simplifier pour obtenir une prévision par jour (ex: la première de chaque jour ou une moyenne)
            const dailyForecasts = {};
            response.data.list.forEach(item => {
                const date = item.dt_txt.split(' ')[0]; // Extrait YYYY-MM-DD
                if (!dailyForecasts[date]) {
                    dailyForecasts[date] = {
                        date: date,
                        temp_min: item.main.temp_min,
                        temp_max: item.main.temp_max,
                        description: item.weather[0].description,
                        icon: item.weather[0].icon,
                        humidity: item.main.humidity,
                        wind_speed: item.wind.speed,
                        details: [] // Pour stocker les prévisions par tranche de 3h si besoin
                    };
                }
                // Agrégation simple : prendre min des min et max des max pour la journée
                dailyForecasts[date].temp_min = Math.min(dailyForecasts[date].temp_min, item.main.temp_min);
                dailyForecasts[date].temp_max = Math.max(dailyForecasts[date].temp_max, item.main.temp_max);
                // On peut stocker la première description ou la plus fréquente
                dailyForecasts[date].details.push({
                    time: item.dt_txt.split(' ')[1],
                    temp: item.main.temp,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon
                });
            });

            const simplifiedForecast = Object.values(dailyForecasts).slice(0, 5); // Prendre les 5 prochains jours

            // Optionnel: Mettre en cache les résultats dans `donnees_meteo_cache`
            // Pour chaque `item` dans `response.data.list` ou `simplifiedForecast`:
            // await dbMeteo.query(
            //     'INSERT INTO donnees_meteo_cache (latitude, longitude, date_prevision, temperature_min_celsius, ...) VALUES (...) ON CONFLICT (latitude, longitude, date_prevision) DO UPDATE SET ...',
            //     [...]
            // );

            return {
                message: "Prévisions météo récupérées avec succès.",
                city: response.data.city.name,
                country: response.data.city.country,
                latitude,
                longitude,
                units,
                forecast: simplifiedForecast
            };
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API OpenWeatherMap (getPrevisions):", error.response ? error.response.data : error.message);
            if (error.response && error.response.status === 401) {
                 throw { status: 401, message: "Clé API OpenWeatherMap invalide ou non autorisée." };
            }
            throw { status: 503, message: "Service météo temporairement indisponible." };
        }
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
        // L'API historique d'OpenWeatherMap est souvent limitée ou payante.
        // Cette fonction reste une SIMULATION ou devrait lire depuis `donnees_meteo_cache`
        // si cette table est peuplée régulièrement (par exemple, via un job quotidien qui récupère la météo du jour).
        console.log(`MeteoService: Appel simulé/cache pour historique à lat ${latitude}, lon ${longitude} de ${dateStart} à ${dateEnd}`);
        
        try {
            const query = `
                SELECT date_prevision as date, temperature_min_celsius as temp_min, temperature_max_celsius as temp_max, 
                       precipitations_mm, humidite_pourcentage, vitesse_vent_kmh, description_meteo, icone_meteo_code
                FROM donnees_meteo_cache
                WHERE latitude = $1 AND longitude = $2 AND date_prevision >= $3 AND date_prevision <= $4
                ORDER BY date_prevision ASC;
            `;
            const result = await dbMeteo.query(query, [latitude, longitude, dateStart, dateEnd]);
            
            if (result.rows.length > 0) {
                return {
                    message: "Historique météo récupéré depuis le cache.",
                    latitude, longitude, dateStart, dateEnd,
                    data: result.rows
                };
            } else {
                 return Promise.resolve({
                    message: "Historique météo simulé (ou aucune donnée en cache pour cette période)",
                    latitude, longitude, dateStart, dateEnd,
                    data: [ { date: dateStart, temp_avg: 20, precipitation_mm: 0 } ] // Donnée de simulation
                });
            }
        } catch (error) {
            console.error("Erreur lors de la lecture du cache météo (getHistorique):", error);
            throw { status: 500, message: "Erreur lors de la récupération de l'historique météo." };
        }
    }
}
module.exports = new MeteoService(); 