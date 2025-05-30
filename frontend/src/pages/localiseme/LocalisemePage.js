import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const LocalisemePage = () => {
  const [adresse, setAdresse] = useState("");
  const [coords, setCoords] = useState({ lat: 36.8065, lon: 10.1815 }); // Tunis par défaut
  const [found, setFound] = useState(false);

  const handleChange = (e) => setAdresse(e.target.value);

  const handleSearch = async (e) => {
    e.preventDefault();
    setFound(false);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        console.log("Adresse trouvée !");
        setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        setFound(true);
      } else {
        setFound(false);
        alert("Adresse non trouvée !");
      }
    } catch {
      setFound(false);
      alert("Erreur réseau !");
    }
  };
console.log('found', found);
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-b from-green-100 to-green-300">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 mt-8">
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Localisez une adresse</h2>
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={adresse}
            onChange={handleChange}
            placeholder="Entrez une adresse ou ville"
            required
            className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Chercher
          </button>
        </form>
        <div className="mb-4">
          <MapContainer
            center={[coords.lat, coords.lon]}
            zoom={found ? 13 : 6}
            style={{ height: "500px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[coords.lat, coords.lon]}>
              <Popup>
                {found ? (
                  <>
                    <b>Adresse trouvée :</b>
                    <br />
                    Latitude : {coords.lat.toFixed(5)}
                    <br />
                    Longitude : {coords.lon.toFixed(5)}
                  </>
                ) : (
                  "Déplacez la carte ou cherchez une adresse."
                )}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default LocalisemePage;