const neo4jManager = require('../services/neo4jManager');

async function addUserFriend(req, res, next) {
    try {
        const {userId} = req.params;
        const {friendId} = req.body;

        const result = await neo4jManager.performQuery('addUserFriend', {
                userId,
                friendId,
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to add user friend', error});
    }
    next();
}

async function addUserFriendByEmail(req, res, next) {
    try {
        const {userId} = req.params;
        const {email} = req.body;
        let result;

        const friendResult = await neo4jManager.performQuery('getUserByEmail', {
                email,
            }
        );
        if (friendResult?.value?.friendId) {
            result = await neo4jManager.performQuery('addUserFriend', {
                    userId,
                    friendId: friendResult?.value?.friendId,
                }
            );
        } else {
            // TODO: add invite by email

            result = await neo4jManager.performQuery('inviteGuestToFriendship', {
                    userId,
                    guestEmail: email,
                }
            );
        }
        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to add user friend', error});
    }
    next();
}

async function areUsersFriends(req, res, next) {
    try {
        const {userId} = req.params;
        const {anotherUserId} = req.body;

        const result = await neo4jManager.performQuery('areUsersFriends', {
                userId,
                anotherUserId,
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to get answer for are users friends', error});
    }
    next();
}

async function getUserFriends(req, res, next) {
    try {
        const {userId} = req.params;

        const result = await neo4jManager.performQuery('getUserFriends', {
                userId,
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to get user friends', error});
    }
    next();
}

async function getUserFriendsOnGroup(req, res, next) {
    try {
        const {userId} = req.params;
        const {groupId} = req.body;


        const result = await neo4jManager.performQuery('getUserFriendsOnGroup', {
                userId,
                groupId
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to get user friends on group', error});
    }
    next();
}

async function removeUserFriend(req, res, next) {
    try {
        const {userId} = req.params;
        const {friendId} = req.body;


        const result = await neo4jManager.performQuery('removeUserFriend', {
                userId,
                friendId
            }
        )

        res.send(result);
    } catch (error) {
        res.status(500).send({message: 'Failed to remove user friend', error});
    }
    next();
}

module.exports = {
    addUserFriendByEmail,
    addUserFriend,
    areUsersFriends,
    getUserFriends,
    getUserFriendsOnGroup,
    removeUserFriend
}