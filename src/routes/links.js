const express = require('express');
const router = express.Router();
const linksController = require('../controllers/linksController');
const services = require('../services/services');

router.post('/saveLink/:userId', [services.setHeaders, linksController.saveLink]);

router.post('/saveLinks/:userId', [services.setHeaders, linksController.saveLinks]);

router.post('/addFaviconAndSaveLinks/:userId', [services.setHeaders, linksController.addFaviconAndSaveLinks]);

router.post('/editLink/:userId', [services.setHeaders, linksController.editLink]);

router.post('/linkClicked/:userId', [services.setHeaders, linksController.linkClicked]);

router.use('/removeLink/:userId', [services.setHeaders, linksController.deleteLink]);

router.use('/removeAllLinks/:userId', [services.setHeaders, linksController.deleteAllLinks]);

router.post('/getAllLinks/:userId', [services.setHeaders, linksController.getAllLinks]);

router.use('/getLink/:linkId', [services.setHeaders, linksController.getLink]);

router.use('/searchAll/:userId', [services.setHeaders, linksController.searchAll]);

module.exports = router;
