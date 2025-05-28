// backend/src/services/elevage.service.js
const dbElevage = require('../config/db.config'); // Simule l'import

class ElevageService {
    async getTypesAnimaux({ page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const dataQuery = 'SELECT id, nom_espece, description_generale FROM animaux_types_catalogue ORDER BY nom_espece LIMIT $1 OFFSET $2;';
        const countQuery = 'SELECT COUNT(*) FROM animaux_types_catalogue;';
        const [dataResult, countResult] = await Promise.all([
            dbElevage.query(dataQuery, [limit, offset]),
            dbElevage.query(countQuery)
        ]);
        const totalItems = parseInt(countResult.rows[0].count, 10);
        return {
            data: dataResult.rows,
            pagination: { currentPage: page, totalPages: Math.ceil(totalItems / limit), totalItems, limit }
        };
    }

    async addAnimalUtilisateur(utilisateur_id, data) {
        const { animal_type_id, identifiant_animal, date_naissance_approx, notes_sante } = data;
        const query = `INSERT INTO animaux_elevage_utilisateur (utilisateur_id, animal_type_id, identifiant_animal, date_naissance_approx, notes_sante)
                       VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
        const result = await dbElevage.query(query, [utilisateur_id, animal_type_id, identifiant_animal, date_naissance_approx, notes_sante]);
        return result.rows[0];
    }

    async getAnimauxUtilisateur(utilisateur_id, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const dataQuery = `SELECT aeu.*, atc.nom_espece 
                       FROM animaux_elevage_utilisateur aeu
                       JOIN animaux_types_catalogue atc ON aeu.animal_type_id = atc.id
                       WHERE aeu.utilisateur_id = $1 ORDER BY aeu.id DESC LIMIT $2 OFFSET $3;`;
        const countQuery = 'SELECT COUNT(*) FROM animaux_elevage_utilisateur WHERE utilisateur_id = $1;';
        const [dataResult, countResult] = await Promise.all([
            dbElevage.query(dataQuery, [utilisateur_id, limit, offset]),
            dbElevage.query(countQuery, [utilisateur_id])
        ]);
        const totalItems = parseInt(countResult.rows[0].count, 10);
        return {
            data: dataResult.rows,
            pagination: { currentPage: page, totalPages: Math.ceil(totalItems / limit), totalItems, limit }
        };
    }
    
    async getAnimalUtilisateurById(id, utilisateur_id) {
        const query = `SELECT aeu.*, atc.nom_espece 
                       FROM animaux_elevage_utilisateur aeu
                       JOIN animaux_types_catalogue atc ON aeu.animal_type_id = atc.id
                       WHERE aeu.id = $1 AND aeu.utilisateur_id = $2;`;
        const result = await dbElevage.query(query, [id, utilisateur_id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async updateAnimalUtilisateur(id, utilisateur_id, data) {
        const { animal_type_id, identifiant_animal, date_naissance_approx, notes_sante } = data;
        // Construire la requête dynamiquement pour ne mettre à jour que les champs fournis
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (animal_type_id !== undefined) { fields.push(`animal_type_id = $${paramCount++}`); values.push(animal_type_id); }
        if (identifiant_animal !== undefined) { fields.push(`identifiant_animal = $${paramCount++}`); values.push(identifiant_animal); }
        if (date_naissance_approx !== undefined) { fields.push(`date_naissance_approx = $${paramCount++}`); values.push(date_naissance_approx); }
        if (notes_sante !== undefined) { fields.push(`notes_sante = $${paramCount++}`); values.push(notes_sante); }
        
        if (fields.length === 0) throw { status: 400, message: "Aucun champ à mettre à jour." };

        values.push(id);
        values.push(utilisateur_id);
        const query = `UPDATE animaux_elevage_utilisateur SET ${fields.join(', ')}
                       WHERE id = $${paramCount++} AND utilisateur_id = $${paramCount} RETURNING *;`;
        const result = await dbElevage.query(query, values);
        return result.rows.length > 0 ? result.rows[0] : null;
    }

    async deleteAnimalUtilisateur(id, utilisateur_id) {
        const query = 'DELETE FROM animaux_elevage_utilisateur WHERE id = $1 AND utilisateur_id = $2 RETURNING id;';
        const result = await dbElevage.query(query, [id, utilisateur_id]);
        return result.rowCount > 0;
    }
}
module.exports = new ElevageService();