const express = require('express');
const router = express.Router();
const services = require('../services/services');
const groupsController = require('../controllers/groupsController');

router.post('/getUserGroups/:userId', [services.setHeaders, groupsController.getUserGroups]);

router.post('/approveJoinRequest/:userId', [services.setHeaders, groupsController.approveJoinRequest]);

router.post('/declineJoinRequest/:userId', [services.setHeaders, groupsController.declineJoinRequest]);

router.post('/createGroup/:userId', [services.setHeaders, groupsController.createGroup]);

router.post('/deleteGroup/:userId', [services.setHeaders, groupsController.deleteGroup]);

router.post('/getGroupMembers/:groupId', [services.setHeaders, groupsController.getGroupMembers]);

router.post('/getGroupPendingJoinRequests/:userId', [services.setHeaders, groupsController.getGroupPendingJoinRequests]);

router.post('/getUserPendingJoinRequests/:userId', [services.setHeaders, groupsController.getUserPendingJoinRequests]);

router.post('/joinGroup/:userId', [services.setHeaders, groupsController.joinGroup]);

router.post('/kickMember/:userId', [services.setHeaders, groupsController.kickMember]);

router.post('/leaveGroup/:userId', [services.setHeaders, groupsController.leaveGroup]);

router.post('/searchGroup/:userId', [services.setHeaders, groupsController.searchGroup]);

router.post('/updateGroup/:userId', [services.setHeaders, groupsController.updateGroup]);

router.post('/getGroupLinks/:groupId', [services.setHeaders, groupsController.getGroupLinks]);

router.post('/addLinkToGroup/:userId/:groupId', [services.setHeaders, groupsController.addLinkToGroup]);

router.post('/deleteLinkFromGroup/:userId/:groupId', [services.setHeaders, groupsController.deleteLinkFromGroup]);

module.exports = router;
