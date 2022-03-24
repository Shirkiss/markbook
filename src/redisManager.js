const redis = require('redis');
const client = redis.createClient();

const start = async () => {
    await client.connect();
};

const addLink = async (userId, link, name, keywords, comment) => {
    const data = {name, keywords, comment};
    await client.HSET(`links:${userId}`, link, JSON.stringify(data));
    return await getAllLinks(userId);
};

const getAllLinks = async (userId) => {
    return await client.HGETALL(`links:${userId}`);
};

const getLink = async (userId, link) => {
    return await client.HGET(`links:${userId}`, link);
};

const removeLink = async (userId, link) => {
    await client.HDEL(`links:${userId}`, link);
    return await getAllLinks(userId);
};

const removeAllLinks = async (userId) => {
    await client.DEL(`links:${userId}`);
};


module.exports = {getLink, getAllLinks, addLink, removeLink, start, removeAllLinks};
