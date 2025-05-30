"use strict";

// backend/src/models/User.model.js
// Nécessite que Sequelize soit initialisé et connecté à la base de données.
// Généralement, vous auriez un fichier index.js dans le dossier /models qui gère cela.

module.exports = (sequelize, DataTypes) => {
  const Utilisateur = sequelize.define('Utilisateur', {
    // Les attributs sont définis ici
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nom_complet: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    mot_de_passe_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    numero_telephone: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'agriculteur',
      allowNull: false
    },
    localisation_preference_lat: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true
    },
    localisation_preference_lon: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true
    },
    derniere_connexion: {
      type: DataTypes.DATE,
      allowNull: true
    }
    // La colonne date_creation (createdAt) et date_modification (updatedAt)
    // sont gérées automatiquement par Sequelize si `timestamps: true` (valeur par défaut).
  }, {
    tableName: 'utilisateurs' // Assurez-vous que le nom de la table correspond à votre BDD
    // timestamps: true, // Active createdAt et updatedAt
    // underscored: true, // Si vous voulez que les colonnes auto-générées soient en snake_case (ex: created_at)
  });
  Utilisateur.associate = models => {
    // Définir les associations ici
    // Par exemple:
    // Utilisateur.hasMany(models.Parcelle, {
    //   foreignKey: 'utilisateur_id',
    //   as: 'parcelles'
    // });
    // Utilisateur.hasMany(models.PostForum, {
    //   foreignKey: 'utilisateur_id',
    //   as: 'posts'
    // });
  };
  return Utilisateur;
};