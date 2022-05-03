const express = require('express');
const router = express.Router();
const services = require('../services/services');
const keywordsController = require('../controllers/keywordsController');

router.use('/initialKeywordsSuggestion/:userId', [services.setHeaders, keywordsController.getInitialKeywordsSuggestion]);

router.use('/keywordsSuggestion/:userId/:prefix', [services.setHeaders, keywordsController.getKeywordsSuggestion]);


module.exports = router;
