// frontend/src/pages/communaute/PostDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getPostDetails, getCommentsForPost, addCommentToPost } from '../../services/communauteService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Textarea } from '../../components/common/FormControls'; // Assuming this exists
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PostDetailPage = ({ navigateTo, postId }) => {
    const { isAuthenticated, user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [isLoadingPost, setIsLoadingPost] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [errorPost, setErrorPost] = useState(null);
    const [errorComments, setErrorComments] = useState(null);

    const [commentsPagination, setCommentsPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 10
    });
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [errorSubmitComment, setErrorSubmitComment] = useState(null);

    const fetchPost = useCallback(async () => {
        if (!postId) {
            setErrorPost("Aucun ID de post fourni.");
            return;
        }
        setIsLoadingPost(true);
        setErrorPost(null);
        try {
            const postData = await getPostDetails(postId);
            setPost(postData);
        } catch (err) {
            console.error(`Erreur lors de la récupération du post ${postId}:`, err);
            setErrorPost(err.message || 'Une erreur est survenue lors de la récupération du post.');
        } finally {
            setIsLoadingPost(false);
        }
    }, [postId]);

    const fetchComments = useCallback(async (page) => {
        if (!postId) return;
        setIsLoadingComments(true);
        setErrorComments(null);
        try {
            const result = await getCommentsForPost(postId, { page, limit: commentsPagination.limit });
            setComments(prevComments => page === 1 ? (result.data || []) : [...prevComments, ...(result.data || [])]);
            setCommentsPagination(result.pagination || { currentPage: page, totalPages: 1, totalItems: result.data?.length || 0, limit: commentsPagination.limit });
        } catch (err) {
            console.error(`Erreur lors de la récupération des commentaires pour le post ${postId}:`, err);
            setErrorComments(err.message || 'Une erreur est survenue lors de la récupération des commentaires.');
        } finally {
            setIsLoadingComments(false);
        }
    }, [postId, commentsPagination.limit]);

    useEffect(() => {
        fetchPost();
        fetchComments(1); // Fetch first page of comments initially
    }, [fetchPost]); // Removed fetchComments from here to avoid re-fetching on comments state change by pagination

    const handleCommentPageChange = (newPage) => {
        if (newPage >= 1 && newPage <= commentsPagination.totalPages && newPage > commentsPagination.currentPage) {
            // Only fetch if newPage is greater, assuming infinite scroll like "load more"
             setCommentsPagination(prev => ({ ...prev, currentPage: newPage }));
             fetchComments(newPage); // Fetch the new page
        } else if (newPage === 1 && commentsPagination.currentPage !==1) { // Allow reset to page 1
            setComments([]); // Clear comments before fetching page 1
            setCommentsPagination(prev => ({ ...prev, currentPage: 1 }));
            fetchComments(1);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            setErrorSubmitComment("Le commentaire ne peut pas être vide.");
            return;
        }
        setIsSubmittingComment(true);
        setErrorSubmitComment(null);
        try {
            await addCommentToPost(postId, { contenu_commentaire: newComment });
            setNewComment('');
            // Refresh comments by fetching the first page again and clearing existing ones
            setComments([]);
            fetchComments(1);
            // Or, ideally, backend returns the new comment and we append it.
            // For now, re-fetching page 1 is simpler.
        } catch (err) {
            console.error("Erreur lors de l'ajout du commentaire:", err);
            setErrorSubmitComment(err.message || "Erreur lors de l'envoi du commentaire.");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    if (!postId) {
        return (
            <Card className="text-center p-6">
                <p className="text-red-500">Erreur: ID de post manquant.</p>
                <Button onClick={() => navigateTo('communauteCategories')} Icon={ArrowLeft} className="mt-4">
                    Retour aux catégories
                </Button>
            </Card>
        );
    }

    if (isLoadingPost) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
                <p className="ml-2">Chargement du post...</p>
            </div>
        );
    }

    if (errorPost) {
        return (
            <Card className="text-red-600 text-center p-4">
                <p>Erreur lors du chargement du post: {errorPost}</p>
                 <Button onClick={() => navigateTo(post?.categorie_id ? 'communautePostsList' : 'communauteCategories', { categorieId: post?.categorie_id })} Icon={ArrowLeft} variant="outline" className="mt-2">
                    Retour
                </Button>
            </Card>
        );
    }

    if (!post) {
         return (
            <Card className="text-center p-6">
                <p className="text-xl text-gray-600">Post non trouvé.</p>
                 <Button onClick={() => navigateTo('communauteCategories')} Icon={ArrowLeft} className="mt-4">
                    Retour aux catégories
                </Button>
            </Card>
        );
    }

    return (
        <div className="space-y-6 p-4 md:p-6">
            <Button
                onClick={() => navigateTo('communautePostsList', { categorieId: post.categorie_id })}
                Icon={ArrowLeft}
                variant="ghost"
                className="mb-0 text-sm text-green-700 hover:text-green-800 self-start"
            >
                Retour à la liste des posts (Catégorie: {post.categorie_id})
            </Button>
            <Card className="p-5 shadow-lg">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{post.titre_post}</h1>
                <div className="text-xs text-gray-500 mb-4">
                    <p>Par: {post.auteur_nom || 'Auteur inconnu'} ({post.auteur_email || 'Email inconnu'})</p>
                    <p>Publié le: {new Date(post.date_creation).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    {post.dernier_commentaire_date && (
                         <p>Dernier commentaire: {new Date(post.dernier_commentaire_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    )}
                </div>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {post.contenu_post}
                </div>
                 <p className="text-xs text-gray-400 mt-4">Note: La modification et la suppression des posts ne sont pas disponibles actuellement.</p>
            </Card>

            <Card className="p-5 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <MessageCircle size={24} className="mr-2 text-green-600"/> Commentaires ({commentsPagination.totalItems})
                </h2>

                {isAuthenticated && (
                    <form onSubmit={handleAddComment} className="mb-6">
                        <Textarea
                            label="Ajouter un commentaire"
                            name="newComment"
                            rows="3"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Votre commentaire..."
                            required
                        />
                        {errorSubmitComment && <p className="text-red-500 text-sm mt-1">{errorSubmitComment}</p>}
                        <Button type="submit" variant="primary" Icon={Send} isLoading={isSubmittingComment} disabled={isSubmittingComment} className="mt-2">
                            {isSubmittingComment ? 'Envoi...' : 'Envoyer le Commentaire'}
                        </Button>
                    </form>
                )}

                {isLoadingComments && comments.length === 0 && <div className="flex justify-center p-4"><LoadingSpinner /></div>}
                {errorComments && <p className="text-red-500 text-sm">Erreur: {errorComments}</p>}

                {comments.length > 0 ? (
                    <div className="space-y-4">
                        {comments.map(comment => (
                            <div key={comment.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">
                                    Par: {comment.auteur_nom || 'Auteur inconnu'} ({comment.auteur_email || 'Email inconnu'})
                                    {' - '}
                                    {new Date(comment.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-gray-700 whitespace-pre-wrap">{comment.contenu_commentaire}</p>
                            </div>
                        ))}
                         {commentsPagination.currentPage < commentsPagination.totalPages && !isLoadingComments && (
                            <Button
                                onClick={() => handleCommentPageChange(commentsPagination.currentPage + 1)}
                                variant="outline"
                                className="w-full mt-4"
                            >
                                Charger plus de commentaires
                            </Button>
                        )}
                    </div>
                ) : (
                    !isLoadingComments && <p className="text-gray-600">Aucun commentaire pour ce post pour le moment.</p>
                )}
                 <p className="text-xs text-gray-400 mt-4">Note: La modification et la suppression des commentaires ne sont pas disponibles actuellement.</p>
            </Card>
        </div>
    );
};

export default PostDetailPage;
