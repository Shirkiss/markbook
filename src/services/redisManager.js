const redis = require('redis');
const client = redis.createClient();

const start = async () => {
    await client.connect();
};

const addLink = async (userId, urlValue, data) => {
    await client.HSET(`links:${userId}`, urlValue, JSON.stringify(data));
};

const getAllLinks = async (userId) => {
    return await client.HGETALL(`links:${userId}`);
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


module.exports = {getLink, getAllLinks, addLink, removeLink, start, removeAllLinks};
