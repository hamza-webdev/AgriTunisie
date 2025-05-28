// backend/src/services/elevage.service.js
const dbElevage = require('../config/db.config'); // Déjà défini en haut

class ElevageService { /* ... (contenu comme précédemment) ... */ 
    async getTypesAnimaux({ page = 1, limit = 20 }) {
        const offset = (page - 1) * limit;
        const dataQuery = 'SELECT id, nom_espece, description_generale FROM animaux_types_catalogue ORDER BY nom_espece LIMIT $1 OFFSET $2;';
        const countQuery = 'SELECT COUNT(*) FROM animaux_types_catalogue;';
        try {
            const [dataResult, countResult] = await Promise.all([ dbElevage.query(dataQuery, [limit, offset]), dbElevage.query(countQuery) ]);
            const totalItems = parseInt(countResult.rows[0].count, 10);
            return { data: dataResult.rows, pagination: { currentPage: page, totalPages: Math.ceil(totalItems / limit), totalItems, limit } };
        } catch (error) { console.error("Erreur ElevageService.getTypesAnimaux:", error); throw error; }
    }
    async addAnimalUtilisateur(utilisateur_id, data) {
        const { animal_type_id, identifiant_animal, date_naissance_approx, notes_sante } = data;
        const query = `INSERT INTO animaux_elevage_utilisateur (utilisateur_id, animal_type_id, identifiant_animal, date_naissance_approx, notes_sante) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
        try {
            const result = await dbElevage.query(query, [utilisateur_id, animal_type_id, identifiant_animal, date_naissance_approx, notes_sante]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23503') throw { status: 400, message: "Type d'animal invalide." };
            console.error("Erreur ElevageService.addAnimalUtilisateur:", error); throw error;
        }
    }
    async getAnimauxUtilisateur(utilisateur_id, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const dataQuery = `SELECT aeu.id, aeu.identifiant_animal, aeu.date_naissance_approx, aeu.notes_sante, atc.nom_espece, atc.id as animal_type_id FROM animaux_elevage_utilisateur aeu JOIN animaux_types_catalogue atc ON aeu.animal_type_id = atc.id WHERE aeu.utilisateur_id = $1 ORDER BY aeu.id DESC LIMIT $2 OFFSET $3;`;
        const countQuery = 'SELECT COUNT(*) FROM animaux_elevage_utilisateur WHERE utilisateur_id = $1;';
        try {
            const [dataResult, countResult] = await Promise.all([ dbElevage.query(dataQuery, [utilisateur_id, limit, offset]), dbElevage.query(countQuery, [utilisateur_id]) ]);
            const totalItems = parseInt(countResult.rows[0].count, 10);
            return { data: dataResult.rows, pagination: { currentPage: page, totalPages: Math.ceil(totalItems / limit), totalItems, limit } };
        } catch (error) { console.error("Erreur ElevageService.getAnimauxUtilisateur:", error); throw error; }
    }
    async getAnimalUtilisateurById(id, utilisateur_id) { /* ... (comme précédemment) ... */ 
        const query = `SELECT aeu.*, atc.nom_espece FROM animaux_elevage_utilisateur aeu JOIN animaux_types_catalogue atc ON aeu.animal_type_id = atc.id WHERE aeu.id = $1 AND aeu.utilisateur_id = $2;`;
        try { const result = await dbElevage.query(query, [id, utilisateur_id]); return result.rows.length > 0 ? result.rows[0] : null; }
        catch (error) { console.error("Erreur ElevageService.getAnimalUtilisateurById:", error); throw error; }
    }
    async updateAnimalUtilisateur(id, utilisateur_id, data) { /* ... (comme précédemment, attention aux index des paramètres) ... */ 
        const { animal_type_id, identifiant_animal, date_naissance_approx, notes_sante } = data;
        const fields = []; const values = []; let paramCount = 1;
        if (animal_type_id !== undefined) { fields.push(`animal_type_id = $${paramCount++}`); values.push(animal_type_id); }
        if (identifiant_animal !== undefined) { fields.push(`identifiant_animal = $${paramCount++}`); values.push(identifiant_animal); }
        if (date_naissance_approx !== undefined) { fields.push(`date_naissance_approx = $${paramCount++}`); values.push(date_naissance_approx); }
        if (notes_sante !== undefined) { fields.push(`notes_sante = $${paramCount++}`); values.push(notes_sante); }
        if (fields.length === 0) throw { status: 400, message: "Aucun champ à mettre à jour." };
        values.push(id); values.push(utilisateur_id);
        // Correction des index pour WHERE
        const query = `UPDATE animaux_elevage_utilisateur SET ${fields.join(', ')} WHERE id = $${paramCount} AND utilisateur_id = $${paramCount + 1} RETURNING *;`;
        try { const result = await dbElevage.query(query, values); return result.rows.length > 0 ? result.rows[0] : null; }
        catch (error) { if (error.code === '23503') throw { status: 400, message: "Type d'animal invalide pour MàJ." }; console.error("Erreur ElevageService.updateAnimalUtilisateur:", error); throw error; }
    }
    async deleteAnimalUtilisateur(id, utilisateur_id) { /* ... (comme précédemment) ... */ 
        const query = 'DELETE FROM animaux_elevage_utilisateur WHERE id = $1 AND utilisateur_id = $2 RETURNING id;';
        try { const result = await dbElevage.query(query, [id, utilisateur_id]); return result.rowCount > 0; }
        catch (error) { console.error("Erreur ElevageService.deleteAnimalUtilisateur:", error); throw error; }
    }
}
module.exports = new ElevageService();
