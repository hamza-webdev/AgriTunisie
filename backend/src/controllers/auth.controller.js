// backend/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.config'); // Ou votre modèle User si vous utilisez Sequelize/Prisma

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

exports.register = async (req, res, next) => {
    const { nom_complet, email, mot_de_passe, numero_telephone } = req.body;

    if (!nom_complet || !email || !mot_de_passe) {
        return res.status(400).json({ message: "Nom complet, email et mot de passe sont requis." });
    }

    try {
        // 1. Vérifier si l'utilisateur existe déjà
        const userExists = await db.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: "Un utilisateur avec cet email existe déjà." });
        }

        // 2. Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, salt);

        // 3. Insérer le nouvel utilisateur
        const newUserQuery = `
            INSERT INTO utilisateurs (nom_complet, email, mot_de_passe_hash, numero_telephone, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, nom_complet, email, role, date_creation;
        `;
        const values = [nom_complet, email, mot_de_passe_hash, numero_telephone, 'agriculteur'];
        const result = await db.query(newUserQuery, values);
        const newUser = result.rows[0];

        // 4. Générer un token JWT (Optionnel à l'inscription, souvent fait au login)
        // const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(201).json({
            message: "Utilisateur enregistré avec succès.",
            user: {
                id: newUser.id,
                nom_complet: newUser.nom_complet,
                email: newUser.email,
                role: newUser.role
            },
            // token // Optionnel
        });

    } catch (error) {
        console.error("Erreur lors de l'enregistrement :", error);
        next(error); // Passe à la gestion d'erreur globale
    }
};

exports.login = async (req, res, next) => {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
        return res.status(400).json({ message: "Email et mot de passe sont requis." });
    }

    try {
        // 1. Trouver l'utilisateur par email
        const userResult = await db.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "Identifiants invalides (email)." });
        }
        const user = userResult.rows[0];

        // 2. Vérifier le mot de passe
        const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Identifiants invalides (mot de passe)." });
        }

        // 3. Générer un token JWT
        const tokenPayload = {
            id: user.id,
            role: user.role,
            nom_complet: user.nom_complet,
            email: user.email
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        // Mettre à jour la dernière connexion (optionnel)
        await db.query('UPDATE utilisateurs SET derniere_connexion = NOW() WHERE id = $1', [user.id]);

        res.status(200).json({
            message: "Connexion réussie.",
            token,
            user: {
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

// exports.refreshToken = async (req, res, next) => { /* Logique pour le refresh token */ };
// exports.logout = async (req, res, next) => { /* Logique pour la déconnexion */ };