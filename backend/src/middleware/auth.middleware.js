// backend/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken'); // Assurez-vous d'avoir fait 'npm install jsonwebtoken'

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format "Bearer TOKEN"

    if (token == null) {
        return res.status(401).json({ message: 'Accès non autorisé : Token manquant.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(403).json({ message: 'Accès interdit : Token expiré.' });
            }
            console.error('Erreur de vérification JWT:', err.message);
            return res.status(403).json({ message: 'Accès interdit : Token invalide.' });
        }
        req.user = user; // Contient les infos du payload du token (id, role, etc.)
        next();
    });
};

exports.authorizeRole = (roles) => { // roles peut être un string ou un array de strings
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Accès interdit : Rôle utilisateur non défini dans le token.' });
        }

        const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        const hasPermission = userRoles.some(role => allowedRoles.includes(role));

        if (!hasPermission) {
            return res.status(403).json({ message: 'Accès interdit : Permissions insuffisantes pour ce rôle.' });
        }
        next();
    };
};
