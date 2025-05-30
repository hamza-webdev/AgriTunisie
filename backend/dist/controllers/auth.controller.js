"use strict";

// backend/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs'); // Assurez-vous d'avoir fait 'npm install bcryptjs'
const jwt = require('jsonwebtoken'); // Déjà importé dans auth.middleware.js, mais nécessaire ici aussi pour signer
const dbAuth = require('../config/db.config'); // Supposé défini en haut du fichier global

exports.register = async (req, res, next) => {
  const {
    nom_complet,
    email,
    mot_de_passe,
    numero_telephone
  } = req.body;
  try {
    const userExistsResult = await dbAuth.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
    if (userExistsResult.rows.length > 0) {
      return res.status(409).json({
        message: "Un utilisateur avec cet email existe déjà."
      });
    }
    const salt = await bcrypt.genSalt(10);
    const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, salt);
    const newUserQuery = `
            INSERT INTO utilisateurs (nom_complet, email, mot_de_passe_hash, numero_telephone, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, nom_complet, email, role, date_creation;
        `;
    const defaultRole = 'agriculteur';
    const values = [nom_complet, email, mot_de_passe_hash, numero_telephone || null, defaultRole];
    const result = await dbAuth.query(newUserQuery, values);
    const newUser = result.rows[0];
    res.status(201).json({
      message: "Utilisateur enregistré avec succès.",
      user: {
        id: newUser.id,
        nom_complet: newUser.nom_complet,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement :", error);
    next(error);
  }
};
exports.login = async (req, res, next) => {
  const {
    email,
    mot_de_passe
  } = req.body;
  try {
    const userResult = await dbAuth.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        message: "Identifiants invalides (email non trouvé)."
      });
    }
    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hash);
    if (!isMatch) {
      return res.status(401).json({
        message: "Identifiants invalides (mot de passe incorrect)."
      });
    }
    const tokenPayload = {
      id: user.id,
      role: user.role,
      nom_complet: user.nom_complet,
      email: user.email
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });
    await dbAuth.query('UPDATE utilisateurs SET derniere_connexion = NOW() WHERE id = $1', [user.id]);
    res.status(200).json({
      message: "Connexion réussie.",
      token,
      user: {
        // Renvoyer les mêmes infos que dans le payload du token pour le frontend
        id: user.id,
        nom_complet: user.nom_complet,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    next(error);
  }
};