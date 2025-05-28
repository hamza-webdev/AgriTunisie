// backend/src/config/db.config.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false, // Pour les connexions SSL (ex: Heroku, Render)
});

pool.on('connect', () => {
    console.log('Pool de connexions PostgreSQL connecté.');
});

pool.on('error', (err) => {
    console.error('Erreur inattendue sur le client du pool PostgreSQL', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(), // Pour les transactions
    pool, // Exporter le pool si nécessaire
};