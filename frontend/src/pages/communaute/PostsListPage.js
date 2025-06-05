// frontend/src/pages/communaute/PostsListPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getPostsByCategorie } from '../../services/communauteService';
// Optional: import getCategoryDetails if you want to display category name/description
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { MessageSquare, PlusCircle, ArrowLeft } from 'lucide-react'; // Example icons
import { useAuth } from '../../contexts/AuthContext'; // To check if user is logged in for "Create Post" button

const PostsListPage = ({ navigateTo, categorieId }) => {
    const { isAuthenticated } = useAuth();
    const [posts, setPosts] = useState([]);
    const [categoryDetails, setCategoryDetails] = useState(null); // Optional: For category info
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 10 // Default limit for posts
    });

    const fetchPosts = useCallback(async (page) => {
        if (!categorieId) {
            setError("Aucun ID de catégorie fourni.");
            setIsLoading(false);
            setPosts([]);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Optional: Fetch category details here too if needed
            // const catDetails = await getCategoryById(categorieId); // Assuming such a service function exists
            // setCategoryDetails(catDetails);

            const result = await getPostsByCategorie(categorieId, { page, limit: pagination.limit });
            setPosts(result.data || []);
            setPagination(result.pagination || { currentPage: page, totalPages: 1, totalItems: result.data?.length || 0, limit: pagination.limit });
        } catch (err) {
            console.error(`Erreur lors de la récupération des posts pour la catégorie ${categorieId}:`, err);
            setError(err.message || 'Une erreur est survenue lors de la récupération des posts.');
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
    }, [categorieId, pagination.limit]);

    useEffect(() => {
        fetchPosts(pagination.currentPage);
    }, [fetchPosts, pagination.currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };

    if (!categorieId) {
        return (
            <Card className="text-center p-6">
                <p className="text-red-500">Erreur: ID de catégorie manquant.</p>
                <Button onClick={() => navigateTo('communauteCategories')} Icon={ArrowLeft} className="mt-4">
                    Retour aux catégories
                </Button>
            </Card>
        );
    }

    if (isLoading && posts.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
                <p className="ml-2">Chargement des posts...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <div className="text-red-600 text-center p-4">
                    <p>Erreur: {error}</p>
                    <Button onClick={() => fetchPosts(1)} className="mt-2 mr-2">Réessayer</Button>
                    <Button onClick={() => navigateTo('communauteCategories')} Icon={ArrowLeft} variant="outline" className="mt-2">
                        Retour aux catégories
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div className="mb-4 sm:mb-0">
                     <Button onClick={() => navigateTo('communauteCategories')} Icon={ArrowLeft} variant="ghost" className="mb-2 text-sm text-green-700 hover:text-green-800">
                        Retour aux catégories
                    </Button>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                        <MessageSquare size={32} className="mr-3 text-green-600" />
                        Posts dans la catégorie {/* categoryDetails ? `: ${categoryDetails.nom_categorie}` : '' */}
                    </h1>
                    {/* Optional: Display category description if fetched */}
                    {/* {categoryDetails && <p className="text-sm text-gray-500 mt-1">{categoryDetails.description_categorie}</p>} */}
                </div>
                {isAuthenticated && (
                    <Button
                        onClick={() => navigateTo('communauteCreatePost', { categorieId: categorieId })}
                        variant="primary"
                        Icon={PlusCircle}
                        className="w-full sm:w-auto"
                    >
                        Créer un nouveau Post
                    </Button>
                )}
            </div>

            {posts.length === 0 && !isLoading ? (
                <Card className="text-center py-10">
                    <p className="text-xl text-gray-600">Aucun post trouvé dans cette catégorie.</p>
                     {isAuthenticated && (
                         <p className="text-gray-500 mt-2 mb-4">Soyez le premier à créer un post !</p>
                     )}
                </Card>
            ) : (
                <div className="space-y-4">
                    {posts.map(post => (
                        <Card
                            key={post.id}
                            className="hover:shadow-lg transition-shadow duration-200 ease-in-out"
                        >
                            <div className="p-4">
                                <h2
                                    className="text-xl font-semibold text-green-700 hover:text-green-800 cursor-pointer"
                                    onClick={() => navigateTo('communautePostDetail', { postId: post.id })}
                                >
                                    {post.titre_post}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Par: {post.auteur_nom || 'Auteur inconnu'} ({post.auteur_email || 'Email inconnu'})
                                </p>
                                <p className="text-xs text-gray-500">
                                    Créé le: {new Date(post.date_creation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {post.dernier_commentaire_date && (
                                     <p className="text-xs text-gray-500">
                                        Dernier commentaire: {new Date(post.dernier_commentaire_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                )}
                                {/* Add post content preview if desired */}
                                {/* <p className="text-gray-700 mt-2 truncate">{post.contenu_post}</p> */}
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

export default PostsListPage;
