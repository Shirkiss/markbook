const neo4jManager = require('../services/neo4jManager');
const elasticsearchManager = require('../services/elasticsearchManager');
const ELASTICSEARCH_LINKS_INDEX = 'links';

async function getUserGroups(req, res, next) {
    try {
        const {userId} = req.params;

        const result = await neo4jManager.performQuery('getUserGroups', {
                userId,
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to get user groups', error});
    }
    next();
}

async function approveJoinRequest(req, res, next) {
    try {
        const {userId} = req.params;
        const {groupId, requestUserId} = req.body;


        const result = await neo4jManager.performQuery('approveJoinRequest', {
                ownerId: userId,
                groupId,
                userId: requestUserId
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to approve join request', error});
    }
    next();
}

async function declineJoinRequest(req, res, next) {
    try {
        const {userId} = req.params;
        const {groupId, requestUserId} = req.body;

        const result = await neo4jManager.performQuery('declineJoinRequest', {
                ownerId: userId,
                groupId,
                userId: requestUserId
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to decline join request', error});
    }
    next();
}

async function createGroup(req, res, next) {
    try {
        const {userId} = req.params;
        const data = req.body;

        const result = await neo4jManager.performQuery('createGroup', {
                ownerId: userId,
                ...data
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to create group', error});
    }
    next();
}

async function deleteGroup(req, res, next) {
    try {
        const {userId} = req.params;
        const {groupId} = req.body;

        const result = await neo4jManager.performQuery('deleteGroup', {
                ownerId: userId,
                groupId
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to delete group', error});
    }
    next();
}

async function getGroupMembers(req, res, next) {
    try {
        const {groupId} = req.params;

        const result = await neo4jManager.performQuery('getGroupMembers', {
                groupId
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to get groups members', error});
    }
    next();
}

async function getGroupPendingJoinRequests(req, res, next) {
    try {
        const {userId} = req.params;
        const {groupId} = req.body;

        const result = await neo4jManager.performQuery('getGroupPendingJoinRequests', {
                ownerId: userId,
                groupId
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to get groups pending join requests', error});
    }
    next();
}

async function getUserPendingJoinRequests(req, res, next) {
    try {
        const {userId} = req.params;

        const result = await neo4jManager.performQuery('getUserPendingJoinRequests', {
                userId,
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to get user pending join requests', error});
    }
    next();
}

async function joinGroup(req, res, next) {
    try {
        const {userId} = req.params;
        const {groupId} = req.body;

        const result = await neo4jManager.performQuery('joinGroup', {
                userId,
                groupId
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to join the group', error});
    }
    next();
}

async function kickMember(req, res, next) {
    try {
        const {userId} = req.params;
        const {groupId, kickedUser} = req.body;

        const result = await neo4jManager.performQuery('kickMember', {
                ownerId: userId,
                groupId,
                userId: kickedUser
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to join the group', error});
    }
    next();
}

async function leaveGroup(req, res, next) {
    try {
        const {userId} = req.params;
        const {groupId} = req.body;

        const result = await neo4jManager.performQuery('leaveGroup', {
                userId,
                groupId,
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to leave the group', error});
    }
    next();
}

async function searchGroup(req, res, next) {
    try {
        const {userId} = req.params;
        const {keyword} = req.body;

        const result = await neo4jManager.performQuery('searchGroup', {
                userId,
                keyword,
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to search group', error});
    }
    next();
}

async function updateGroup(req, res, next) {
    try {
        const {userId} = req.params;
        const data = req.body;

        const result = await neo4jManager.performQuery('updateGroup', {
                ownerId: userId,
                ...data
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to update group', error});
    }
    next();
}

async function getGroupLinks(req, res, next) {
    try {
        const {groupId} = req.params;

        const {value} = await neo4jManager.performQuery('getGroupLinks', {
                groupId
            }
        )

        const links = await elasticsearchManager.getByIds(value.groupLinks, ELASTICSEARCH_LINKS_INDEX);
        res.send(links);
    } catch (error) {
        res.status(500).send({message: 'Failed to get groups links', error});
    }
    next();
}

async function addLinkToGroup(req, res, next) {
    try {
        const {groupId, userId} = req.params;
        const {linkId} = req.body;

        const result = await neo4jManager.performQuery('addLinkToGroup', {
                userId,
                groupId,
                linkId
            }
        )
        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to add link to group', error});
    }
    next();
}

async function deleteLinkFromGroup(req, res, next) {
    try {
        const {groupId, userId} = req.params;
        const {linkId} = req.body;

        const result = await neo4jManager.performQuery('deleteLinkFromGroup', {
                userId,
                groupId,
                linkId
            }
        )
        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to delete link from group', error});
    }
    next();
}


module.exports = {
    deleteLinkFromGroup,
    addLinkToGroup,
    getUserGroups,
    approveJoinRequest,
    createGroup,
    declineJoinRequest,
    deleteGroup,
    getGroupMembers,
    getGroupPendingJoinRequests,
    getUserPendingJoinRequests,
    joinGroup,
    kickMember,
    leaveGroup,
    searchGroup,
    updateGroup,
    getGroupLinks
}