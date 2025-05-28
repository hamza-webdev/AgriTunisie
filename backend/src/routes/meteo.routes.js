// backend/src/routes/meteo.routes.js
const expressMeteo = require('express');
const routerMeteo = expressMeteo.Router();
const meteoController = require('../controllers/meteo.controller'); // Assurez-vous que le chemin est correct
const meteoValidator = require('../middleware/validators/meteo.validator'); // Assurez-vous que le chemin est correct
const { authenticateToken: authenticateTokenMeteo } = require('../middleware/auth.middleware');

routerMeteo.use(authenticateTokenMeteo); // Protéger toutes les routes météo

routerMeteo.get('/previsions', meteoValidator.previsionsMeteoValidationRules(), meteoValidator.validateMeteo, meteoController.getPrevisionsMeteo);
routerMeteo.get('/historique', meteoValidator.historiqueMeteoValidationRules(), meteoValidator.validateMeteo, meteoController.getHistoriqueMeteo);

module.exports = routerMeteo;
