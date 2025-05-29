// frontend/src/pages/communaute/CategoriesListPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getCategories } from '../../services/communauteService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button'; // If needed for pagination or other actions
import { MessageSquare, ChevronRight } from 'lucide-react'; // Example icons

const CategoriesListPage = ({ navigateTo }) => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 20 // Default limit, adjust as needed
    });

    const fetchCategories = useCallback(async (page) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getCategories({ page, limit: pagination.limit });
            setCategories(result.data || []);
            setPagination(result.pagination || { currentPage: page, totalPages: 1, totalItems: result.data?.length || 0, limit: pagination.limit });
        } catch (err) {
            console.error("Erreur lors de la récupération des catégories:", err);
            setError(err.message || 'Une erreur est survenue lors de la récupération des catégories.');
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.limit]);

    useEffect(() => {
        fetchCategories(pagination.currentPage);
    }, [fetchCategories, pagination.currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };

    if (isLoading && categories.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
                <p className="ml-2">Chargement des catégories...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <div className="text-red-600 text-center p-4">
                    <p>Erreur: {error}</p>
                    <Button onClick={() => fetchCategories(1)} className="mt-2">Réessayer</Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex items-center mb-6">
                <MessageSquare size={32} className="mr-3 text-green-600" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Catégories du Forum</h1>
            </div>

            {categories.length === 0 && !isLoading ? (
                <Card className="text-center py-10">
                    <p className="text-xl text-gray-600">Aucune catégorie de forum trouvée.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {categories.map(categorie => (
                        <Card 
                            key={categorie.id} 
                            className="hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer"
                            onClick={() => navigateTo('communautePostsList', { categorieId: categorie.id })}
                        >
                            <div className="flex justify-between items-center p-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-green-700 hover:text-green-800">{categorie.nom_categorie}</h2>
                                    {categorie.description_categorie && (
                                        <p className="text-sm text-gray-600 mt-1">{categorie.description_categorie}</p>
                                    )}
                                </div>
                                <ChevronRight size={24} className="text-gray-400" />
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center space-x-2">
                    <Button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1 || isLoading}
                        variant="outline"
                    >
                        Précédent
                    </Button>
                    <span className="text-gray-700">
                        Page {pagination.currentPage} sur {pagination.totalPages}
                    </span>
                    <Button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages || isLoading}
                        variant="outline"
                    >
                        Suivant
                    </Button>
                </div>
            )}
        </div>
    );
};

export default CategoriesListPage;
