// backend/src/routes/communaute.routes.js
const expressComm = require('express');
const routerComm = expressComm.Router();
const commController = require('../controllers/communaute.controller');
const commValidator = require('../middleware/validators/communaute.validator');
const { authenticateToken: authenticateTokenComm } = require('../middleware/auth.middleware');

routerComm.get('/categories', commValidator.paginationRulesComm(), commValidator.validateComm, commController.getCategories);
routerComm.get('/posts/categorie/:categorieId', commValidator.idParamRules('categorieId'), commValidator.paginationRulesComm(), commValidator.validateComm, commController.getPosts);
routerComm.get('/posts/:postId', commValidator.idParamRules('postId'), commValidator.validateComm, commController.getPostDetails);
routerComm.get('/posts/:postId/commentaires', commValidator.idParamRules('postId'), commValidator.paginationRulesComm(), commValidator.validateComm, commController.getCommentsForPost);

routerComm.use(authenticateTokenComm); // Routes suivantes protégées
routerComm.post('/posts', commValidator.createPostRules(), commValidator.validateComm, commController.createPost);
routerComm.post('/posts/:postId/commentaires', commValidator.idParamRules('postId'), commValidator.addCommentRules(), commValidator.validateComm, commController.addCommentToPost);

module.exports = routerComm;

