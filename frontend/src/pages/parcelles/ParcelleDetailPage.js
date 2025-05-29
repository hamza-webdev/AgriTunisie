// src/pages/parcelles/ParcelleDetailPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as parcelleService from '../../services/parcelleService'; // Assurez-vous que le chemin est correct et que l'import est correct (named/default)
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Edit3 } from 'lucide-react';

const ParcelleDetailPage = ({ navigateTo, parcelleId }) => {
    const [parcelle, setParcelle] = useState(null);
    const [loadingState, setLoadingState] = useState(true);
    const [error, setError] = useState('');
    const { logout, isAuthenticated } = useAuth(); // Add isAuthenticated

    useEffect(() => {
        if (parcelleId && isAuthenticated) { // Check isAuthenticated
            setLoadingState(true);
            parcelleService.getParcelleById(parcelleId)
                .then(data => { setParcelle(data); setLoadingState(false); })
                .catch(err => {
                    setError(err.message || "Erreur chargement détails parcelle.");
                    if (err.message.includes("401")) { logout(); navigateTo('login'); } setLoadingState(false);
                });
        } else if (!isAuthenticated && parcelleId) { // If not authenticated but trying to load detail
            logout(); // Ensure logout state is consistent
            navigateTo('login');
        }
    }, [parcelleId, logout, navigateTo, isAuthenticated]); // Add isAuthenticated

    if (loadingState) return <div className="flex justify-center mt-10"><LoadingSpinner size="lg" /></div>;
    if (error) return <Alert message={error} type="error" />;
    if (!parcelle) return <Alert message="Parcelle non trouvée." type="warning" />;

    return (
        <Card>
            <div className="flex justify-between items-start"><h1 className="text-3xl font-bold text-gray-800 mb-2">{parcelle.nom_parcelle}</h1><Button onClick={() => navigateTo(`editParcelle/${parcelle.id}`)} variant="secondary" Icon={Edit3}>Modifier</Button></div>
            <p className="text-gray-600 mb-4">{parcelle.description || "Aucune description."}</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><h3 className="text-lg font-semibold text-gray-700">Informations Générales</h3><ul className="mt-2 space-y-1 text-sm text-gray-600"><li><strong>Superficie:</strong> {parcelle.superficie_calculee_ha || 'N/A'} ha</li><li><strong>Type de sol:</strong> {parcelle.type_sol_predominant || 'N/A'}</li><li><strong>Date de création:</strong> {new Date(parcelle.date_creation).toLocaleDateString()}</li></ul></div>
                <div><h3 className="text-lg font-semibold text-gray-700">Géométrie (GeoJSON)</h3><pre className="mt-2 bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">{JSON.stringify(parcelle.geometrie, null, 2) || "Non définie"}</pre></div>
            </div>
            <div className="mt-8"><Button onClick={() => navigateTo('parcelles')} variant="ghost">Retour à la liste</Button></div>
        </Card>
    );
};
export default ParcelleDetailPage;