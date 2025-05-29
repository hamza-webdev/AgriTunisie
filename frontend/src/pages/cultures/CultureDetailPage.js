// frontend/src/pages/cultures/CultureDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getCultureById, deleteCulture } from '../../services/cultureService'; // Corrected import path
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

const CultureDetailPage = ({ navigateTo, cultureId }) => {
    const [culture, setCulture] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCultureDetail = useCallback(async () => {
        if (!cultureId) {
            setError("Aucun ID de culture fourni.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const data = await getCultureById(cultureId);
            if (data) {
                setCulture(data);
            } else {
                setError("Culture non trouvée.");
            }
        } catch (err) {
            console.error("Erreur lors de la récupération des détails de la culture:", err);
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setIsLoading(false);
        }
    }, [cultureId]);

    useEffect(() => {
        fetchCultureDetail();
    }, [fetchCultureDetail]);

    const handleDeleteCulture = async () => {
        // IMPORTANT: Backend API for delete might not be active.
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette culture ? Cette action est irréversible.')) {
            try {
                await deleteCulture(cultureId);
                navigateTo('culturesList'); // Navigate back to list after deletion
            } catch (err) {
                console.error("Erreur lors de la suppression de la culture:", err);
                setError(err.message || 'Erreur lors de la suppression.');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <div className="text-red-600 text-center p-4">
                    <p>Erreur: {error}</p>
                    <Button onClick={() => navigateTo('culturesList')} className="mt-2 mr-2">Retour à la liste</Button>
                    {cultureId && <Button onClick={fetchCultureDetail} className="mt-2">Réessayer</Button>}
                </div>
            </Card>
        );
    }

    if (!culture) {
        return (
            <Card>
                <p className="text-center p-4">Aucune donnée de culture à afficher.</p>
                 <div className="mt-4 text-center">
                    <Button onClick={() => navigateTo('culturesList')} variant="outline">
                        Retour à la liste
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">{culture.nom_culture}</h1>
                <p className="text-sm text-gray-500">ID: {culture.id}</p>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold text-gray-700">Description Générale:</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{culture.description_generale || 'Non spécifiée'}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700">Période de Semis Idéale:</h3>
                    <p className="text-gray-600">
                        Du {culture.periode_semis_ideale_debut || 'N/A'} au {culture.periode_semis_ideale_fin || 'N/A'}
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700">Besoins en Eau (mm/cycle):</h3>
                    <p className="text-gray-600">{culture.besoins_eau_mm_cycle || 'Non spécifié'}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700">Type de Sol Recommandé:</h3>
                    <p className="text-gray-600">{culture.type_sol_recommande || 'Non spécifié'}</p>
                </div>
                {/* Display other fields as needed, e.g., cycle_de_vie_jours, rendement_attendu_kg_ha, etc. if they exist */}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                <Button onClick={() => navigateTo('culturesList')} variant="outline">
                    Retour à la liste
                </Button>
                <Button onClick={() => navigateTo('editCulture', culture.id)} variant="warning">
                    Modifier {/* TODO: Comment: Backend dependent */}
                </Button>
                <Button onClick={handleDeleteCulture} variant="danger">
                    Supprimer {/* TODO: Comment: Backend dependent */}
                </Button>
            </div>
        </Card>
    );
};

export default CultureDetailPage;
