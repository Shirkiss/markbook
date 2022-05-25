const redisManager = require('../services/redisManager');
const neo4jManager = require('../services/neo4jManager');
const {sendMail} = require('../services/mailSender');

async function addGroupsInvitations(email, userId) {
    const guestGroups = await neo4jManager.performQuery('getGuestGroupInvitations', {
            guestEmail: email
        }
    );

    if (guestGroups.value) {
        const groups = guestGroups.value;
        for (let i = 0; i < groups.length; ++i) {
            await neo4jManager.performQuery('joinGroup', {
                    groupId: groups[i],
                    userId
                }
            );
        }
    }
}

async function addFriendsInvitations(email, friendId) {
    const guestFriends = await neo4jManager.performQuery('getGuestFriendsInvitations', {
            guestEmail: email
        }
    );

    if (guestFriends.value) {
        const users = guestFriends.value;
        for (let i = 0; i < users.length; ++i) {
            await neo4jManager.performQuery('addUserFriend', {
                    userId: users[i],
                    friendId
                }
            );
        }
    }
}

async function addUserInfo(req, res, next) {
    try {
        const {userId} = req.params;
        const data = req.body;
        const {email} = data;
        await redisManager.addUserInfo(userId, data);
        const result = await neo4jManager.performQuery('createUser', {
                userId,
                email: email
            }
        );
        await addGroupsInvitations(email, userId);
        await addFriendsInvitations(email, userId);

        await neo4jManager.performQuery('deleteGuest', {
                guestEmail: email,
            }
        );
        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to save user info', error});
    }
    next();
}

async function addUserInfoField(req, res, next) {
    try {
        const {userId} = req.params;
        const {field, value} = req.body;
        await redisManager.addUserInfoField(userId, field, value);
        res.send(`User info ${field} saved successfully`);
    } catch (error) {
        res.status(500).send({message: 'Failed to save user info for specific field', error});
    }
    next();
}

async function getUserInfo(req, res, next) {
    try {
        const {userId} = req.params;
        const userInfo = await redisManager.getAllUserInfo(userId);
        res.send(userInfo);
    } catch (error) {
        res.status(500).send({message: 'Failed to get user info', error});
    }
    next();
}

async function getUserInfoField(req, res, next) {
    try {
        const {userId} = req.params;
        const {field} = req.body;
        const userInfo = await redisManager.getUserInfo(userId, field);
        res.send({[field]: userInfo});
    } catch (error) {
        res.status(500).send({message: 'Failed to get user info', error});
    }
    next();
}

async function deleteUser(req, res, next) {
    try {
        const {userId} = req.params;
        await redisManager.deleteUserInfo(userId);
        const result = await neo4jManager.performQuery('deleteUser', {
                userId,
            }
        )
        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to get user info', error});
    }
    next();
}

async function sendInvitationByEmail(req, res, next) {
    try {
        const {userId} = req.params;
        const {friendEmail} = req.body;
        const name = await redisManager.getUserInfo(userId, 'name');
        await sendMail(friendEmail, name);
        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to get user info', error});
    }
    next();
}

module.exports = {
    sendInvitationByEmail,
    addUserInfo,
    getUserInfo,
    addUserInfoField,
    getUserInfoField,
    deleteUser
}