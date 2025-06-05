// frontend/src/pages/meteo/MeteoPage.js
import React, { useState, useEffect } from 'react';
import { getPrevisions, getHistorique } from '../../services/meteoService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/FormControls'; // Assuming this exists
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext'; // To potentially get user's default location

const MeteoPage = ({ navigateTo }) => {
    const { user } = useAuth(); // Example: if user profile has lat/lon

    // State for form inputs
    const [latitude, setLatitude] = useState(user?.defaultLatitude || '36.8065'); // Default to Tunis if not in user profile
    const [longitude, setLongitude] = useState(user?.defaultLongitude || '10.1815');
    const [units, setUnits] = useState('metric');
    const [dateStart, setDateStart] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Default to 7 days ago
    const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]); // Default to today

    // State for API data
    const [previsionsData, setPrevisionsData] = useState(null);
    const [historiqueData, setHistoriqueData] = useState(null);
    const [isLoadingPrevisions, setIsLoadingPrevisions] = useState(false);
    const [isLoadingHistorique, setIsLoadingHistorique] = useState(false);
    const [errorPrevisions, setErrorPrevisions] = useState(null);
    const [errorHistorique, setErrorHistorique] = useState(null);

    const handleFetchPrevisions = async (e) => {
        e.preventDefault();
        setIsLoadingPrevisions(true);
        setErrorPrevisions(null);
        setPrevisionsData(null);
        try {
            const data = await getPrevisions(parseFloat(latitude), parseFloat(longitude), units);
            setPrevisionsData(data);
        } catch (err) {
            setErrorPrevisions(err.message || 'Erreur lors de la récupération des prévisions.');
        } finally {
            setIsLoadingPrevisions(false);
        }
    };

    const handleFetchHistorique = async (e) => {
        e.preventDefault();
        setIsLoadingHistorique(true);
        setErrorHistorique(null);
        setHistoriqueData(null);
        try {
            const data = await getHistorique(parseFloat(latitude), parseFloat(longitude), dateStart, dateEnd);
            setHistoriqueData(data);
        } catch (err) {
            setErrorHistorique(err.message || 'Erreur lors de la récupération de l'historique.');
        } finally {
            setIsLoadingHistorique(false);
        }
    };

    // Helper to get OpenWeatherMap icon URL
    const getWeatherIconUrl = (iconCode) => {
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    };

    return (
        <div className="space-y-8">
            <Card>
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Météo Agricole</h1>

                <form onSubmit={handleFetchPrevisions} className="space-y-4 p-4 border rounded-md mb-6">
                    <h2 className="text-xl font-medium text-gray-700">Prévisions Météo</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label="Latitude" name="latitude" type="number" value={latitude} onChange={(e) => setLatitude(e.target.value)} required step="any" />
                        <Input label="Longitude" name="longitude" type="number" value={longitude} onChange={(e) => setLongitude(e.target.value)} required step="any" />
                        <div>
                            <label htmlFor="units" className="block text-sm font-medium text-gray-700 mb-1">Unités</label>
                            <select id="units" name="units" value={units} onChange={(e) => setUnits(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="metric">Celsius (°C)</option>
                                <option value="imperial">Fahrenheit (°F)</option>
                            </select>
                        </div>
                    </div>
                    <Button type="submit" variant="primary" isLoading={isLoadingPrevisions} disabled={isLoadingPrevisions}>
                        Obtenir les Prévisions
                    </Button>
                    {errorPrevisions && <p className="text-red-500 text-sm mt-2">{errorPrevisions}</p>}
                </form>

                {isLoadingPrevisions && <div className="flex justify-center p-4"><LoadingSpinner /></div>}
                {previsionsData && previsionsData.forecast && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                            Prévisions pour {previsionsData.city}, {previsionsData.country} (Lat: {previsionsData.latitude}, Lon: {previsionsData.longitude})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                            {previsionsData.forecast.map((day, index) => (
                                <Card key={index} className="text-center p-3 shadow-sm">
                                    <p className="font-semibold text-gray-600">{new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                                    <img src={getWeatherIconUrl(day.icon)} alt={day.description} className="w-16 h-16 mx-auto" />
                                    <p className="text-sm text-gray-500 capitalize">{day.description}</p>
                                    <p className="text-lg font-bold text-blue-600">{day.temp_max}°</p>
                                    <p className="text-sm text-gray-500">{day.temp_min}°</p>
                                    {day.humidity_avg != null && <p className="text-xs text-gray-500">Hum: {day.humidity_avg}%</p>}
                                    {day.wind_speed_avg != null && <p className="text-xs text-gray-500">Vent: {day.wind_speed_avg} {units === 'metric' ? 'm/s' : 'mph'}</p>}
                                    {day.precipitation_total != null && <p className="text-xs text-gray-500">Précip: {day.precipitation_total}mm</p>}
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            <Card>
                <form onSubmit={handleFetchHistorique} className="space-y-4 p-4 border rounded-md">
                    <h2 className="text-xl font-medium text-gray-700">Historique Météo</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Latitude (pour historique)" name="hist_latitude" type="number" value={latitude} onChange={(e) => setLatitude(e.target.value)} required step="any" />
                        <Input label="Longitude (pour historique)" name="hist_longitude" type="number" value={longitude} onChange={(e) => setLongitude(e.target.value)} required step="any" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Date de Début" name="dateStart" type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} required />
                        <Input label="Date de Fin" name="dateEnd" type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} required />
                    </div>
                    <Button type="submit" variant="primary" isLoading={isLoadingHistorique} disabled={isLoadingHistorique}>
                        Obtenir l'Historique
                    </Button>
                    {errorHistorique && <p className="text-red-500 text-sm mt-2">{errorHistorique}</p>}
                </form>

                {isLoadingHistorique && <div className="flex justify-center p-4"><LoadingSpinner /></div>}
                {historiqueData && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-700 my-2">
                            Historique pour Lat: {historiqueData.latitude}, Lon: {historiqueData.longitude} (Du {historiqueData.dateStart} au {historiqueData.dateEnd})
                        </h3>
                        {historiqueData.data && historiqueData.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white shadow">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Temp (°C)</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Temp (°C)</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Précip (mm)</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Humidité (%)</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vent (km/h)</th>
                                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {historiqueData.data.map((day, index) => (
                                            <tr key={index}>
                                                <td className="py-2 px-3 text-sm text-gray-900">{new Date(day.date).toLocaleDateString('fr-FR')}</td>
                                                <td className="py-2 px-3 text-sm text-gray-500">{day.temp_min}</td>
                                                <td className="py-2 px-3 text-sm text-gray-500">{day.temp_max}</td>
                                                <td className="py-2 px-3 text-sm text-gray-500">{day.precipitation_total != null ? day.precipitation_total : 'N/A'}</td>
                                                <td className="py-2 px-3 text-sm text-gray-500">{day.humidity_avg}</td>
                                                <td className="py-2 px-3 text-sm text-gray-500">{day.wind_speed_avg}</td>
                                                <td className="py-2 px-3 text-sm text-gray-500 flex items-center">
                                                    {day.icone_meteo_code && <img src={getWeatherIconUrl(day.icone_meteo_code)} alt={day.description_meteo || 'icon'} className="w-6 h-6 mr-1" />}
                                                    {day.description_meteo}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="p-4 text-gray-600">Aucune donnée historique trouvée pour la sélection.</p>}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MeteoPage;