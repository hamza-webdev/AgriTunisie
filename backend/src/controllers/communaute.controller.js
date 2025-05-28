// backend/src/controllers/communaute.controller.js
const communauteServiceInstance = require('../services/communaute.service');

exports.getCategories = async (req, res, next) => {
    const { page, limit } = req.query;
    try { res.json(await communauteServiceInstance.getCategories({ page: parseInt(page) || 1, limit: parseInt(limit) || 20 })); }
    catch (e) { next(e); }
};
exports.createPost = async (req, res, next) => {
    try { res.status(201).json(await communauteServiceInstance.createPost(req.user.id, req.body)); }
    catch (e) {
        if (e.code === '23503') return res.status(400).json({ message: "Catégorie invalide." });
        next(e);
    }
};
exports.getPosts = async (req, res, next) => { // getPostsByCategorie
    const { categorieId } = req.params;
    const { page, limit } = req.query;
    try { res.json(await communauteServiceInstance.getPostsByCategorie(categorieId, { page: parseInt(page) || 1, limit: parseInt(limit) || 10 })); }
    catch (e) { next(e); }
};
exports.getPostDetails = async (req, res, next) => {
    try {
        const post = await communauteServiceInstance.getPostById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post non trouvé." });
        res.json(post);
    } catch (e) { next(e); }
};
exports.addCommentToPost = async (req, res, next) => {
    const { postId } = req.params;
    const { contenu_commentaire } = req.body;
    try {
        // Vérifier si le post existe d'abord
        const postExists = await communauteServiceInstance.getPostById(postId);
        if (!postExists) return res.status(404).json({ message: "Post non trouvé pour commenter." });
        res.status(201).json(await communauteServiceInstance.addComment(postId, req.user.id, contenu_commentaire));
    } catch (e) { next(e); }
};
exports.getCommentsForPost = async (req, res, next) => {
    const { postId } = req.params;
    const { page, limit } = req.query;
    try { res.json(await communauteServiceInstance.getCommentsByPost(postId, { page: parseInt(page) || 1, limit: parseInt(limit) || 10 })); }
    catch (e) { next(e); }
};
