const express = require('express');
const router = express.Router();
const linksController = require('../controllers/linksController');
const services = require('../services/services');

router.post('/saveLink/:id', [services.setHeaders, linksController.saveLink]);

router.post('/editLink/:id', [services.setHeaders, linksController.editLink]);

router.use('/removeLink/:id', [services.setHeaders, linksController.removeLink]);

router.use('/removeAllLinks/:id', [services.setHeaders, linksController.removeAllLinks]);

router.post('/getAllLinks/:id', [services.setHeaders, linksController.getAllLinks]);

router.use('/getLink/:id', [services.setHeaders, linksController.getLink]);

module.exports = router;
