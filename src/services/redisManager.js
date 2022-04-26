const redis = require('redis');
const client = redis.createClient();

const start = async () => {
    await client.connect();
};

const addLink = async (userId, urlValue, data) => {
    await client.HSET(`links:${userId}`, urlValue, JSON.stringify(data));
};

const addUserInfoField = async (userId, field, value) => {
    await client.HSET(`users:${userId}`, field, value);
};

const addUserInfo = async (userId, data) => {
    for (const field in data) {
        await client.HSET(`users:${userId}`, field, data[field]);
    }
};

const getAllLinks = async (userId) => {
    return await client.HGETALL(`links:${userId}`);
};

const getAllUserInfo = async (userId) => {
    return await client.HGETALL(`users:${userId}`);
};

const getUserInfo = async (userId, field) => {
    return await client.HGET(`users:${userId}`, field);
};

const getLink = async (userId, urlValue) => {
    return await client.HGET(`links:${userId}`, urlValue);
};

const removeLink = async (userId, urlValue) => {
    await client.HDEL(`links:${userId}`, urlValue);
};

const removeAllLinks = async (userId) => {
    await client.DEL(`links:${userId}`);
};


module.exports = {
    getLink,
    getAllLinks,
    addLink,
    removeLink,
    start,
    removeAllLinks,
    addUserInfo,
    getAllUserInfo,
    getUserInfo,
    addUserInfoField
};
