// src/pages/communaute/CommunautePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input'; // Used for title
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PlusCircle, Edit2, Trash2, MessageSquare, XCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const CommunautePage = ({ navigateTo }) => {
    const { user, token } = useAuth();
    console.log('User:', user);
    console.log('Token:', token);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [editingPostId, setEditingPostId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/communaute`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // GET requests might not need auth, or might for private communities
                },
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: 'Erreur lors de la récupération des posts.' }));
                throw new Error(errData.message || 'Erreur lors de la récupération des posts.');
            }
            const data = await response.json();
            // Assuming the API returns an array of posts, possibly nested e.g., { posts: [] }
            setPosts(Array.isArray(data) ? data : data.posts || []);
        } catch (err) {
            setError(err.message);
            setPosts([]); // Clear posts on error
        } finally {
            setLoading(false);
        }
    }, []); // Removed token dependency for now, add if your GET /communaute needs it

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({ title: '', content: '' });
        setEditingPostId(null);
        setIsFormVisible(false);
        setFormLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) {
            setError("Le titre et le contenu sont requis et ne peuvent pas être vides.");
            return;
        }
        setFormLoading(true);
        setError('');
        setSuccess('');
        console.log('Form data:', formData);
        console.log('API_URL :', API_URL);
        const url = editingPostId ? `${API_URL}/communaute/${editingPostId}` : `${API_URL}/communaute`;
        const method = editingPostId ? 'PUT' : 'POST';
        
        console.log('Method:', method);
        try {
            console.log('Sending request to:', url);
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            console.log('Response:', response.json());
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || (editingPostId ? 'Erreur lors de la mise à jour du post.' : 'Erreur lors de la création du post.'));
            }
            setSuccess(editingPostId ? "Post mis à jour avec succès !" : "Post créé avec succès !");
            resetForm();
            fetchPosts(); 
        } catch (err) {
            setError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (post) => {
        // Assurez-vous que post.id existe. Si votre API utilise _id, changez post.id en post._id
        setEditingPostId(post.id || post._id); 
        setFormData({ title: post.title, content: post.content });
        setIsFormVisible(true);
        setSuccess('');
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) return;
        
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`${API_URL}/communaute/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: 'Erreur lors de la suppression du post.' }));
                throw new Error(errData.message || 'Erreur lors de la suppression du post.');
            }
            setSuccess("Post supprimé avec succès !");
            fetchPosts(); // Refresh posts list
        } catch (err) {
            setError(err.message);
        }
    };

    const openCreateForm = () => {
        resetForm();
        setIsFormVisible(true);
        setSuccess('');
        setError('');
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                    <MessageSquare size={32} className="mr-3 text-green-600" />
                    Espace Communauté
                </h1>
                {!isFormVisible && user && ( // Show button only if user is logged in
                    <Button onClick={openCreateForm} variant="primary" Icon={PlusCircle}>
                        Ajouter un Post
                    </Button>
                )}
            </div>

            {error && <Alert message={error} type="error" onClose={() => setError('')} className="mb-4" />}
            {success && <Alert message={success} type="success" onClose={() => setSuccess('')} className="mb-4" />}

            {isFormVisible && user && ( // Show form only if user is logged in
                <Card className="mb-6 shadow-xl border border-green-200">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl md:text-2xl font-semibold text-gray-700">{editingPostId ? 'Modifier le Post' : 'Créer un Nouveau Post'}</h2>
                            <Button onClick={resetForm} variant="ghost" size="sm" Icon={XCircle} className="text-gray-500 hover:text-red-600" aria-label="Fermer le formulaire" />
                        </div>
                        <Input
                            label="Titre du Post"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Un titre accrocheur pour votre post"
                            required
                        />
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                            <textarea
                                id="content"
                                name="content"
                                rows="5"
                                value={formData.content}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                placeholder="Partagez vos pensées, questions ou actualités ici..."
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-3 pt-2">
                            <Button type="button" variant="secondary" onClick={resetForm} disabled={formLoading}>
                                Annuler
                            </Button>
                            <Button type="submit" variant="primary" disabled={formLoading} Icon={formLoading ? null : (editingPostId ? Edit2 : PlusCircle)}>
                                {formLoading ? <LoadingSpinner size="sm" /> : (editingPostId ? 'Mettre à jour' : 'Publier le Post')}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {loading && posts.length === 0 ? (
                <div className="text-center py-10">
                    <LoadingSpinner size="lg" />
                    <p className="mt-3 text-gray-600 text-lg">Chargement des posts...</p>
                </div>
            ) : !loading && posts.length === 0 ? (
                <Card className="text-center py-12 bg-gray-50">
                    <MessageSquare size={56} className="mx-auto text-gray-400 mb-5" />
                    <p className="text-xl text-gray-600 mb-3">Aucun post dans la communauté pour le moment.</p>
                    {user && ( // Show button only if user is logged in
                        <>
                            <p className="text-gray-500 mb-6">Soyez le premier à partager quelque chose !</p>
                            {!isFormVisible && (
                                <Button onClick={openCreateForm} variant="primary" Icon={PlusCircle} size="lg">
                                    Créer le Premier Post
                                </Button>
                            )}
                        </>
                    )}
                    {!user && (
                         <p className="text-gray-500">Connectez-vous pour participer à la communauté.</p>
                    )}
                </Card>
            ) : (
                <div className="space-y-5">
                    {posts.map(post => (
                        <Card key={post.id || post._id} className="shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg md:text-xl font-semibold text-green-700 hover:text-green-800">{post.title}</h3>
                                    <p className="text-xs text-gray-500">
                                        {post.author ? `Par: ${post.author.nom_complet || post.author.email}` : (post.userId ? `Par: Utilisateur ID ${post.userId}`: 'Auteur inconnu')}
                                        {' - '}
                                        {new Date(post.createdAt || post.created_at || Date.now()).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {/* Show controls if user is logged in and is the author or an admin */}
                                {user && ( (post.userId === user.id || (post.author && post.author.id === user.id)) || user.role === 'admin') && (
                                    <div className="flex space-x-2 flex-shrink-0 ml-2">
                                        <Button onClick={() => handleEdit(post)} variant="ghost" size="sm" Icon={Edit2} className="text-blue-600 hover:text-blue-700 p-1" aria-label="Modifier le post" />
                                        <Button onClick={() => handleDelete(post.id || post._id)} variant="ghost" size="sm" Icon={Trash2} className="text-red-500 hover:text-red-700 p-1" aria-label="Supprimer le post" />
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-700 mt-1 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommunautePage;
