const express = require('express');
const router = express.Router();
const services = require('../services/services');
const friendsController = require('../controllers/friendsController');

router.post('/addUserFriend/:userId', [services.setHeaders, friendsController.addUserFriend]);

router.post('/areUsersFriends/:userId', [services.setHeaders, friendsController.areUsersFriends]);

router.post('/getUserFriends/:userId', [services.setHeaders, friendsController.getUserFriends]);

router.post('/getUserFriendsOnGroup/:userId', [services.setHeaders, friendsController.getUserFriendsOnGroup]);

router.post('/getUserGroups/:userId', [services.setHeaders, friendsController.getUserFriendsOnGroup]);

router.post('/removeUserFriend/:userId', [services.setHeaders, friendsController.removeUserFriend]);

module.exports = router;
