const express = require('express');
const router = express.Router();
const services = require('../services/services');
const userController = require('../controllers/usersController');

router.post('/addUserInfo/:userId', [services.setHeaders, userController.addUserInfo]);

router.post('/addUserInfoField/:userId', [services.setHeaders, userController.addUserInfoField]);

router.use('/getUserInfo/:userId', [services.setHeaders, userController.getUserInfo]);

router.post('/getUserInfoField/:userId', [services.setHeaders, userController.getUserInfoField]);

router.post('/deleteUser/:userId', [services.setHeaders, userController.deleteUser]);

router.post('/sendInvitationByEmail/:userId', [services.setHeaders, userController.sendInvitationByEmail]);

module.exports = router;
