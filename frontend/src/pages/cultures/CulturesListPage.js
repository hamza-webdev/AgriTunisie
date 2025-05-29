// frontend/src/pages/cultures/CulturesListPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getAllCultures, deleteCulture } from '../../services/cultureService'; // Corrected import path
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button'; // Assuming Button component exists
import { Card } from '../../components/common/Card'; // Assuming Card component exists

const CulturesListPage = ({ navigateTo }) => {
    const [cultures, setCultures] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10; // Items per page

    const fetchCultures = useCallback(async (page) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAllCultures(page, limit);
            setCultures(data.data || []); // Ensure cultures is always an array
            setTotalPages(data.pagination.totalPages || 0);
            setTotalItems(data.pagination.totalItems || 0);
            setCurrentPage(data.pagination.currentPage || 1);
        } catch (err) {
            console.error("Erreur lors de la récupération des cultures:", err);
            setError(err.message || 'Une erreur est survenue.');
            setCultures([]); // Ensure cultures is empty on error
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchCultures(currentPage);
    }, [fetchCultures, currentPage]);

    const handleDeleteCulture = async (cultureId) => {
        // IMPORTANT: Backend API for delete might not be active.
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette culture ? Cette action est irréversible.')) {
            try {
                await deleteCulture(cultureId);
                // Re-fetch cultures list to reflect the deletion
                fetchCultures(currentPage);
                // Alternatively, filter out the deleted culture from the local state:
                // setCultures(prevCultures => prevCultures.filter(c => c.id !== cultureId));
            } catch (err) {
                console.error("Erreur lors de la suppression de la culture:", err);
                setError(err.message || 'Erreur lors de la suppression.');
                // Consider if you need to alert the user more directly here
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
                    <Button onClick={() => fetchCultures(currentPage)} className="mt-2">Réessayer</Button>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Catalogue des Cultures</h1>
                <Button onClick={() => navigateTo('addCulture')} variant="primary">
                    Ajouter une Culture
                </Button>
            </div>

            {cultures.length === 0 && !isLoading ? (
                <p className="text-gray-600 text-center">Aucune culture trouvée dans le catalogue.</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white shadow-md rounded-lg">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Nom</th>
                                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Période de Semis</th>
                                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {cultures.map((culture) => (
                                    <tr key={culture.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-4">{culture.nom_culture}</td>
                                        <td className="py-3 px-4">
                                            {culture.periode_semis_ideale_debut} - {culture.periode_semis_ideale_fin}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Button onClick={() => navigateTo('cultureDetail', culture.id)} variant="info" size="sm" className="mr-2">
                                                Détails
                                            </Button>
                                            <Button onClick={() => navigateTo('editCulture', culture.id)} variant="warning" size="sm" className="mr-2">
                                                Modifier {/* TODO: Comment: Backend dependent */}
                                            </Button>
                                            <Button onClick={() => handleDeleteCulture(culture.id)} variant="danger" size="sm">
                                                Supprimer {/* TODO: Comment: Backend dependent */}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center items-center space-x-2">
                            <Button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                variant="outline"
                            >
                                Précédent
                            </Button>
                            <span className="text-gray-700">
                                Page {currentPage} sur {totalPages} ({totalItems} éléments)
                            </span>
                            <Button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                variant="outline"
                            >
                                Suivant
                            </Button>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
};

export default CulturesListPage;
