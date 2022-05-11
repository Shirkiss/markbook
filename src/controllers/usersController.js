const redisManager = require('../services/redisManager');
const neo4jManager = require('../services/neo4jManager');

async function addUserInfo(req, res, next) {
    try {
        const {userId} = req.params;
        const data = req.body;
        await redisManager.addUserInfo(userId, data);
        const result = await neo4jManager.performQuery('createUser', {
                userId,
            }
        )
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

module.exports = {
    addUserInfo,
    getUserInfo,
    addUserInfoField,
    getUserInfoField,
    deleteUser
}