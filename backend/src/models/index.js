// backend/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format "Bearer TOKEN"

    if (token == null) {
        return res.status(401).json({ message: 'Accès non autorisé : Token manquant.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        console.log('Token:', token);
        console.log('JWT_SECRET:', JWT_SECRET);
        if (err) {
            if (err.name === 'TokenExpiredError') {
                 console.error('Erreur de vérification JWT:', err);
                 console.log('JWT_SECRET:', process.env.JWT_SECRET);
                console.log('Token index js', token);
                return res.status(403).json({ message: 'Accès interdit : Token expiré.' });
            }
            console.error('Erreur de vérification JWT:', err);
            return res.status(403).json({ message: 'Accès interdit : Token invalide.' });
        }
        req.user = user; // Ajoute les informations de l'utilisateur décodées à l'objet req
        next(); // Passe au prochain middleware ou au contrôleur
    });
};

exports.authorizeRole = (roles) => { // roles peut être un string ou un array de strings
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Accès interdit : Rôle utilisateur non défini.' });
        }

        const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        const hasPermission = userRoles.some(role => allowedRoles.includes(role));

        if (!hasPermission) {
            return res.status(403).json({ message: 'Accès interdit : Permissions insuffisantes.' });
        }
        next();
    };
};