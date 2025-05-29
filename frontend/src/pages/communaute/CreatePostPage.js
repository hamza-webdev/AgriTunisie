// frontend/src/pages/communaute/CreatePostPage.js
import React, { useState, useEffect } from 'react';
import { createPost } from '../../services/communauteService';
// Optional: import getCategoryDetails if you want to display category name/description
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/FormControls'; // Assuming these exist
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; // To ensure user is authenticated

const CreatePostPage = ({ navigateTo, categorieId }) => {
    const { isAuthenticated } = useAuth(); // Should ideally be protected by router already

    const [formData, setFormData] = useState({
        titre_post: '',
        contenu_post: ''
    });
    const [categoryDetails, setCategoryDetails] = useState(null); // Optional
    const [isLoading, setIsLoading] = useState(false); // For form submission
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    // Optional: Fetch category details to display category name
    // useEffect(() => {
    //     const fetchCategoryInfo = async () => {
    //         if (categorieId) {
    //             try {
    //                 // const catData = await getCategoryById(categorieId); // Assuming such a service fn exists
    //                 // setCategoryDetails(catData);
    //             } catch (err) {
    //                 console.error("Erreur chargement détails catégorie:", err);
    //             }
    //         }
    //     };
    //     fetchCategoryInfo();
    // }, [categorieId]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.titre_post.trim()) errors.titre_post = "Le titre du post est requis.";
        if (!formData.contenu_post.trim()) errors.contenu_post = "Le contenu du post est requis.";
        if (!categorieId) errors.categorieId = "L'ID de la catégorie est manquant. Impossible de créer le post."; // Should not happen if router passes it
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setError(null);
        try {
            const postData = {
                ...formData,
                categorie_id: categorieId 
            };
            const newPost = await createPost(postData);
            // Navigate to the new post's detail page or the posts list for the category
            navigateTo('communautePostDetail', { postId: newPost.id });
        } catch (err) {
            console.error("Erreur lors de la création du post:", err);
            setError(err.message || 'Une erreur est survenue lors de la création du post.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) { // Should be handled by AppRouter, but as a fallback
        return (
            <Card className="text-center p-6">
                <p className="text-red-500">Accès non autorisé. Veuillez vous connecter.</p>
                <Button onClick={() => navigateTo('login')} className="mt-4">Se connecter</Button>
            </Card>
        );
    }
    
    if (!categorieId) {
        return (
            <Card className="text-center p-6">
                <p className="text-red-500">Erreur: ID de catégorie non fourni. Impossible de créer un post.</p>
                <Button onClick={() => navigateTo('communauteCategories')} Icon={ArrowLeft} className="mt-4">
                    Retour aux catégories
                </Button>
            </Card>
        );
    }

    return (
        <div className="p-4 md:p-6">
             <Button 
                onClick={() => navigateTo('communautePostsList', { categorieId: categorieId })} 
                Icon={ArrowLeft} 
                variant="ghost" 
                className="mb-4 text-sm text-green-700 hover:text-green-800 self-start"
            >
                Retour aux posts de la catégorie {/* categoryDetails ? categoryDetails.nom_categorie : categorieId */}
            </Button>
            <Card className="p-5 shadow-lg">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                    Créer un Nouveau Post
                </h1>
                {/* Optional: Display category name if fetched */}
                {/* {categoryDetails && <p className="text-md text-gray-600 mb-4">Dans la catégorie : {categoryDetails.nom_categorie}</p>} */}
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Erreur: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Titre du Post"
                        name="titre_post"
                        value={formData.titre_post}
                        onChange={handleChange}
                        error={formErrors.titre_post}
                        placeholder="Titre de votre nouveau post"
                        required
                    />
                    <Textarea
                        label="Contenu du Post"
                        name="contenu_post"
                        value={formData.contenu_post}
                        onChange={handleChange}
                        error={formErrors.contenu_post}
                        rows="8"
                        placeholder="Rédigez le contenu de votre post ici..."
                        required
                    />
                     {formErrors.categorieId && <p className="text-red-500 text-sm">{formErrors.categorieId}</p>}

                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                        <Button 
                            type="button" 
                            onClick={() => navigateTo('communautePostsList', { categorieId: categorieId })} 
                            variant="outline" 
                            disabled={isLoading}
                        >
                            Annuler
                        </Button>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            Icon={Send} 
                            isLoading={isLoading} 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Publication...' : 'Publier le Post'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreatePostPage;
