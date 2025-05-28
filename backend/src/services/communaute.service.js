// backend/src/services/communaute.service.js
const dbCommunaute = require('../config/db.config');

class CommunauteService {
    // Catégories
    async getCategories({ page = 1, limit = 20 }) {
        const offset = (page - 1) * limit;
        const dataQuery = 'SELECT * FROM forum_categories ORDER BY nom_categorie LIMIT $1 OFFSET $2;';
        const countQuery = 'SELECT COUNT(*) FROM forum_categories;';
        const [data, count] = await Promise.all([dbCommunaute.query(dataQuery, [limit, offset]), dbCommunaute.query(countQuery)]);
        return { data: data.rows, pagination: { currentPage: page, totalPages: Math.ceil(parseInt(count.rows[0].count)/limit), totalItems: parseInt(count.rows[0].count), limit } };
    }
    // Posts
    async createPost(utilisateur_id, data) {
        const { categorie_id, titre_post, contenu_post } = data;
        const q = 'INSERT INTO forum_posts (utilisateur_id, categorie_id, titre_post, contenu_post) VALUES ($1, $2, $3, $4) RETURNING *;';
        const res = await dbCommunaute.query(q, [utilisateur_id, categorie_id, titre_post, contenu_post]);
        return res.rows[0];
    }
    async getPostsByCategorie(categorie_id, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const dataQ = `SELECT fp.*, u.nom_complet as auteur_nom, u.email as auteur_email 
                       FROM forum_posts fp JOIN utilisateurs u ON fp.utilisateur_id = u.id 
                       WHERE fp.categorie_id = $1 ORDER BY fp.dernier_commentaire_date DESC, fp.date_creation DESC LIMIT $2 OFFSET $3;`;
        const countQ = 'SELECT COUNT(*) FROM forum_posts WHERE categorie_id = $1;';
        const [data, count] = await Promise.all([dbCommunaute.query(dataQ, [categorie_id, limit, offset]), dbCommunaute.query(countQ, [categorie_id])]);
        return { data: data.rows, pagination: { currentPage: page, totalPages: Math.ceil(parseInt(count.rows[0].count)/limit), totalItems: parseInt(count.rows[0].count), limit } };
    }
    async getPostById(post_id) {
        const q = `SELECT fp.*, u.nom_complet as auteur_nom, u.email as auteur_email 
                   FROM forum_posts fp JOIN utilisateurs u ON fp.utilisateur_id = u.id 
                   WHERE fp.id = $1;`;
        const res = await dbCommunaute.query(q, [post_id]);
        return res.rows.length > 0 ? res.rows[0] : null;
    }
    // Commentaires
    async addComment(post_id, utilisateur_id, contenu_commentaire) {
        // Mettre à jour dernier_commentaire_date sur le post aussi (transaction serait mieux)
        await dbCommunaute.query('UPDATE forum_posts SET dernier_commentaire_date = NOW() WHERE id = $1;', [post_id]);
        const q = 'INSERT INTO forum_commentaires (post_id, utilisateur_id, contenu_commentaire) VALUES ($1, $2, $3) RETURNING *;';
        const res = await dbCommunaute.query(q, [post_id, utilisateur_id, contenu_commentaire]);
        return res.rows[0];
    }
    async getCommentsByPost(post_id, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const dataQ = `SELECT fc.*, u.nom_complet as auteur_nom, u.email as auteur_email
                       FROM forum_commentaires fc JOIN utilisateurs u ON fc.utilisateur_id = u.id
                       WHERE fc.post_id = $1 ORDER BY fc.date_creation ASC LIMIT $2 OFFSET $3;`;
        const countQ = 'SELECT COUNT(*) FROM forum_commentaires WHERE post_id = $1;';
        const [data, count] = await Promise.all([dbCommunaute.query(dataQ, [post_id, limit, offset]), dbCommunaute.query(countQ, [post_id])]);
        return { data: data.rows, pagination: { currentPage: page, totalPages: Math.ceil(parseInt(count.rows[0].count)/limit), totalItems: parseInt(count.rows[0].count), limit } };
    }
}
module.exports = new CommunauteService();