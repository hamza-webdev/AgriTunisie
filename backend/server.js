// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = 'dev' === process.env.NODE_ENV ? require('morgan') : null;

// const { sequelize } = require('./src/models'); // Décommenter si vous utilisez Sequelize et avez un index.js dans models
const db = require('./src/config/db.config'); // Pour une connexion directe ou une configuration de pool

const mainRoutes = require('./src/routes/index.routes');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middlewares de base
app.use(helmet()); // Sécurité des en-têtes HTTP
app.use(cors({ // Configuration CORS
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json()); // Pour parser les requêtes JSON
app.use(express.urlencoded({ extended: true })); // Pour parser les requêtes URL-encoded

if (morgan) {
    app.use(morgan('dev')); // Logging des requêtes en mode développement
}

// Routes principales de l'API
app.use('/api', mainRoutes);

// Route de test
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API AgriTunisie Connect!' });
});

// Gestionnaire d'erreurs global (exemple basique)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Une erreur interne est survenue.',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Démarrage du serveur
const startServer = async () => {
    try {
        // Test de la connexion à la base de données
        // Pour Sequelize: await sequelize.authenticate();
        // Pour node-postgres (pg) direct, vous pouvez tester une requête simple ici
        await db.query('SELECT NOW()'); // Exemple de test avec pg
        console.log('Connexion à la base de données PostgreSQL établie avec succès.');

        app.listen(PORT, () => {
            console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Impossible de démarrer le serveur ou de se connecter à la base de données:', error);
        process.exit(1); // Quitter avec une erreur
    }
};

startServer();