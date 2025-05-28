// backend/src/services/meteo.service.js
const axios = require('axios'); 
const dbMeteo = require('../config/db.config'); // Déjà défini en haut

class MeteoService {
    async getPrevisions(latitude, longitude, units = 'metric') {
        const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
        if (!OPENWEATHERMAP_API_KEY) {
            console.warn("MeteoService: Clé API OpenWeatherMap manquante. Utilisation de données de simulation.");
            return this.getSimulatedPrevisions(latitude, longitude, units);
        }
        const lang = 'fr';
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${units}&appid=${OPENWEATHERMAP_API_KEY}&lang=${lang}`;
        try {
            const response = await axios.get(url);
            const formattedData = this.formatOpenWeatherForecast(response.data, units);
            // ... (logique de cache comme précédemment) ...
            return formattedData;
        } catch (error) {
            // ... (gestion d'erreur comme précédemment) ...
            console.error("Erreur API OpenWeatherMap (getPrevisions):", error.response ? error.response.data : error.message);
            if (error.response) { /* ... */ }
            throw { status: 503, message: "Service météo temporairement indisponible." };
        }
    }
    formatOpenWeatherForecast(apiResponse, units) { /* ... (comme précédemment) ... */ 
        const dailyForecasts = {};
        const tzOffset = apiResponse.city.timezone; 
        apiResponse.list.forEach(item => {
            const localDateTime = new Date((item.dt + tzOffset) * 1000);
            const date = localDateTime.toISOString().split('T')[0]; 
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = { date: date, temp_min: item.main.temp_min, temp_max: item.main.temp_max, temps: [], humidities: [], wind_speeds: [], precipitations_3h: []  };
            }
            dailyForecasts[date].temp_min = Math.min(dailyForecasts[date].temp_min, item.main.temp_min);
            dailyForecasts[date].temp_max = Math.max(dailyForecasts[date].temp_max, item.main.temp_max);
            dailyForecasts[date].temps.push({ description: item.weather[0].description, icon: item.weather[0].icon });
            dailyForecasts[date].humidities.push(item.main.humidity);
            dailyForecasts[date].wind_speeds.push(item.wind.speed);
            if (item.rain && item.rain['3h']) { dailyForecasts[date].precipitations_3h.push(item.rain['3h']); }
            else if (item.snow && item.snow['3h']) { dailyForecasts[date].precipitations_3h.push(item.snow['3h']);}
        });
        const simplifiedForecast = Object.values(dailyForecasts).map(dayData => {
            const representativeWeather = dayData.temps.length > 0 ? dayData.temps[Math.floor(dayData.temps.length / 2)] : {description: 'N/A', icon: '01d'};
            const humidity_avg = dayData.humidities.length > 0 ? Math.round(dayData.humidities.reduce((a, b) => a + b, 0) / dayData.humidities.length) : null;
            const wind_speed_avg = dayData.wind_speeds.length > 0 ? parseFloat((dayData.wind_speeds.reduce((a, b) => a + b, 0) / dayData.wind_speeds.length).toFixed(2)) : null;
            const precipitation_total = dayData.precipitations_3h.length > 0 ? parseFloat(dayData.precipitations_3h.reduce((a,b) => a + b, 0).toFixed(2)) : 0;
            return { date: dayData.date, temp_min: parseFloat(dayData.temp_min.toFixed(1)), temp_max: parseFloat(dayData.temp_max.toFixed(1)), description: representativeWeather.description, icon: representativeWeather.icon, humidity_avg: humidity_avg, wind_speed_avg: wind_speed_avg, precipitation_total: precipitation_total };
        }).slice(0, 7); 
        return { message: "Prévisions météo récupérées.", city: apiResponse.city.name, country: apiResponse.city.country, latitude: apiResponse.city.coord.lat, longitude: apiResponse.city.coord.lon, units, forecast: simplifiedForecast };
    }
    getSimulatedPrevisions(latitude, longitude, units) { /* ... (comme précédemment) ... */ 
        return { message: "Prévisions simulées", city: "Simville", country: "TN", latitude, longitude, units, forecast: [{ date: "2025-01-01", temp_min:10, temp_max:20, description:"Simulé", icon:"01d"}]};
    }
    async getHistorique(latitude, longitude, dateStart, dateEnd) { /* ... (comme précédemment) ... */ 
        try {
            const query = `SELECT date_prevision as date, temperature_min_celsius as temp_min, temperature_max_celsius as temp_max, precipitations_mm, humidite_pourcentage as humidity_avg, vitesse_vent_kmh as wind_speed_avg, description_meteo, icone_meteo_code FROM donnees_meteo_cache WHERE latitude = $1 AND longitude = $2 AND date_prevision >= $3 AND date_prevision <= $4 ORDER BY date_prevision ASC;`;
            const result = await dbMeteo.query(query, [latitude, longitude, dateStart, dateEnd]);
            if (result.rows.length > 0) { return { message: "Historique depuis cache.", latitude, longitude, dateStart, dateEnd, data: result.rows.map(r => ({...r, precipitation_total: r.precipitations_mm})) }; }
            else { return { message: "Aucune donnée en cache.", latitude, longitude, dateStart, dateEnd, data: [] }; }
        } catch (error) { throw { status: 500, message: "Erreur récupération historique." }; }
    }
}
module.exports = new MeteoService();
