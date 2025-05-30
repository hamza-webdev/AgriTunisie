"use strict";

// Créons une couche de service pour séparer la logique métier des contrôleurs.
// backend/src/services/parcelle.service.js
const db = require('../config/db.config');
class ParcelleService {
  async create(utilisateur_id, data) {
    const {
      nom_parcelle,
      description,
      geometrie,
      superficie_calculee_ha,
      type_sol_predominant,
      culture_actuelle_id
    } = data;
    const geometrieGeoJSON = typeof geometrie === 'string' ? geometrie : JSON.stringify(geometrie);
    const query = `
            INSERT INTO parcelles (utilisateur_id, nom_parcelle, description, geometrie, superficie_calculee_ha, type_sol_predominant, culture_actuelle_id)
            VALUES ($1, $2, $3, ST_GeomFromGeoJSON($4), $5, $6, $7)
            RETURNING id, nom_parcelle, ST_AsGeoJSON(geometrie) as geometrie, superficie_calculee_ha, type_sol_predominant, culture_actuelle_id, date_creation;
        `;
    const values = [utilisateur_id, nom_parcelle, description, geometrieGeoJSON, superficie_calculee_ha, type_sol_predominant, culture_actuelle_id];
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === 'XX000' && error.message.includes('invalid GeoJSON representation')) {
        throw {
          status: 400,
          message: "Format GeoJSON invalide pour la géométrie."
        };
      }
      throw error; // Relancer pour gestion globale
    }
  }
  async findByUserId(utilisateur_id, {
    page = 1,
    limit = 10
  }) {
    const offset = (page - 1) * limit;
    const dataQuery = `
            SELECT id, nom_parcelle, description, ST_AsGeoJSON(geometrie) as geometrie, superficie_calculee_ha, type_sol_predominant, culture_actuelle_id, date_creation
            FROM parcelles
            WHERE utilisateur_id = $1
            ORDER BY date_creation DESC
            LIMIT $2 OFFSET $3;
        `;
    const countQuery = 'SELECT COUNT(*) FROM parcelles WHERE utilisateur_id = $1;';
    try {
      const [dataResult, countResult] = await Promise.all([db.query(dataQuery, [utilisateur_id, limit, offset]), db.query(countQuery, [utilisateur_id])]);
      const totalItems = parseInt(countResult.rows[0].count, 10);
      const totalPages = Math.ceil(totalItems / limit);
      return {
        data: dataResult.rows,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          limit
        }
      };
    } catch (error) {
      throw error;
    }
  }
  async findByIdAndUserId(id, utilisateur_id) {
    const query = `
            SELECT id, nom_parcelle, description, ST_AsGeoJSON(geometrie) as geometrie, superficie_calculee_ha, type_sol_predominant, culture_actuelle_id, date_creation
            FROM parcelles
            WHERE id = $1 AND utilisateur_id = $2;
        `;
    try {
      const result = await db.query(query, [id, utilisateur_id]);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
  async update(id, utilisateur_id, data) {
    const {
      nom_parcelle,
      description,
      geometrie,
      superficie_calculee_ha,
      type_sol_predominant,
      culture_actuelle_id
    } = data;
    const setClauses = [];
    const values = [];
    let paramIndex = 1;
    if (nom_parcelle !== undefined) {
      setClauses.push(`nom_parcelle = $${paramIndex++}`);
      values.push(nom_parcelle);
    }
    if (description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (geometrie !== undefined) {
      const geometrieGeoJSON = typeof geometrie === 'string' ? geometrie : JSON.stringify(geometrie);
      setClauses.push(`geometrie = ST_GeomFromGeoJSON($${paramIndex++})`);
      values.push(geometrieGeoJSON);
    }
    if (superficie_calculee_ha !== undefined) {
      setClauses.push(`superficie_calculee_ha = $${paramIndex++}`);
      values.push(superficie_calculee_ha);
    }
    if (type_sol_predominant !== undefined) {
      setClauses.push(`type_sol_predominant = $${paramIndex++}`);
      values.push(type_sol_predominant);
    }
    if (culture_actuelle_id !== undefined) {
      setClauses.push(`culture_actuelle_id = $${paramIndex++}`);
      values.push(culture_actuelle_id);
    }
    if (setClauses.length === 0) {
      throw {
        status: 400,
        message: "Aucune donnée à mettre à jour."
      };
    }
    values.push(id);
    values.push(utilisateur_id);
    const query = `
            UPDATE parcelles
            SET ${setClauses.join(', ')}
            WHERE id = $${paramIndex++} AND utilisateur_id = $${paramIndex}
            RETURNING id, nom_parcelle, ST_AsGeoJSON(geometrie) as geometrie, superficie_calculee_ha, type_sol_predominant, culture_actuelle_id, date_creation;
        `;
    try {
      const result = await db.query(query, values);
      if (result.rows.length === 0) {
        return null; // Non trouvé ou non autorisé
      }
      return result.rows[0];
    } catch (error) {
      if (error.code === 'XX000' && error.message.includes('invalid GeoJSON representation')) {
        throw {
          status: 400,
          message: "Format GeoJSON invalide pour la géométrie lors de la mise à jour."
        };
      }
      throw error;
    }
  }
  async delete(id, utilisateur_id) {
    const query = `
            DELETE FROM parcelles
            WHERE id = $1 AND utilisateur_id = $2
            RETURNING id;
        `;
    try {
      const result = await db.query(query, [id, utilisateur_id]);
      return result.rowCount > 0; // Renvoie true si supprimé, false sinon
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new ParcelleService();