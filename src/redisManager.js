const redis = require('redis');
const client = redis.createClient();

const start = async () => {
    await client.connect();
};

const addLink = async (userId, link, name, keywords, comment) => {
    const data = {name, keywords, comment};
    await client.HSET(`links:${userId}`, link, JSON.stringify(data));
};

const getAllLinks = async (userId) => {
    return await client.HGETALL(`links:${userId}`);
};

const getLink = async (link) => {
    return await client.HGET('links:1', link);
};

const removeLink = async (userId, link) => {
    await client.HDEL(`links:${userId}`, link);
};

const removeAllLinks = async (userId) => {
    await client.DEL(`links:${userId}`);
};


module.exports = {getLink, getAllLinks, addLink, removeLink, start, removeAllLinks};
