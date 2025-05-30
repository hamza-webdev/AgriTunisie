import React, { useState } from 'react';
import axios from "axios";

const MeteoPage = () => {
  const [ville, setVille] = useState("");
  const [meteo, setMeteo] = useState(null);
  const [erreur, setErreur] = useState("");

  const handleChange = (e) => setVille(e.target.value);

  // Fonction utilitaire pour convertir un timestamp en heure locale
  const formatHeure = (timestamp, timezone) => {
    if (!timestamp || !timezone) return "";
    const date = new Date((timestamp + timezone) * 1000);
    return date.toUTCString().slice(17, 22); // HH:MM
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setMeteo(null);
    try {
      const apiKey = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${ville}&appid=${apiKey}&units=metric&lang=ar`;
      const { data } = await axios.get(url);
      setMeteo(data);
    } catch (err) {
      setErreur("Ville non trouvée ou erreur réseau.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-b from-green-100 to-green-300">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 mt-8">
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Météo Agricole</h2>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            value={ville}
            onChange={handleChange}
            placeholder="Entrez une ville"
            required
            className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Rechercher
          </button>
        </form>
        {erreur && <p className="text-red-500 text-center mb-4">{erreur}</p>}
        {meteo && (
          <div className="flex flex-col items-center bg-green-50 rounded-lg p-6 shadow-inner">
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              {meteo.name} <span className="text-base text-green-500 font-normal">({meteo.sys.country})</span>
            </h3>
            <img
              src={`https://openweathermap.org/img/wn/${meteo.weather[0].icon}@4x.png`}
              alt={meteo.weather[0].description}
              className="w-24 h-24"
            />
            <div className="text-5xl font-bold text-green-900 mb-2">
              {Math.round(meteo.main.temp)}°C
            </div>
            <div className="capitalize text-green-700 mb-4">{meteo.weather[0].description}</div>
            <div className="flex flex-wrap justify-center gap-4 text-green-800 mb-2">
              <div> 
               | {meteo.main.humidity}% <span className="font-semibold">:رطوبة</span>
              </div>
              <div>
               | {meteo.wind.speed} m/s <span className="font-semibold">:رياح</span> 
              </div>
              <div>
               | {Math.round(meteo.main.feels_like)}°C <span className="font-semibold">:حرارة</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-green-800 mb-2">
              <div>
                <span className="font-semibold">  شروق الشمس على الساعة  :</span>{" "}
                {formatHeure(meteo.sys.sunrise, meteo.timezone)}
              </div>
              <div>
                <span className="font-semibold"> غروب الشمس على الساعة  :</span>{" "}
                {formatHeure(meteo.sys.sunset, meteo.timezone)}
              </div>
            </div>
            
            <div className="mt-2 text-green-900 text-sm">
              <span className="font-semibold"> : الاحداثيات </span>{" "}
              {meteo.coord && (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-300"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                  Latitude ( خط العرض ) : {meteo.coord.lat} 
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-300"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                  Longitude ( خط الطول ) : {meteo.coord.lon}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeteoPage;

