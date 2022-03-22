const redis = require('redis');
const client = redis.createClient();


const addLink = async (link, name, keywords, comment) => {
    const data = {name, keywords, comment};
    await client.connect();
    await client.HSET('links:1', link, JSON.stringify(data));
    client.quit();
};

const getAllLinks = async () => {
    await client.connect();
    const links = await client.HGETALL('links:1');
    client.quit();
    return links;
};

const getLink = async (link) => {
    const savedLink = await client.HGET('links:1', link);
    console.log(savedLink);
};

const removeLink = async (link) => {
    await client.connect();
    await client.HDEL('links:1', link);
    client.quit()
};


module.exports = {getLink, getAllLinks, addLink, removeLink};
