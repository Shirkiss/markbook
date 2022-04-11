const redisManager = require('../redisManager');

async function saveLink(req, res, next) {
    try {
        const {keywords, urlValue, name, caption, isPrivate, favIconUrl} = req.body;
        const userId = req.params.id;
        const keywordsSplit = keywords.split(',');
        const data = {name, keywordsSplit, caption, isPrivate, favIconUrl};
        await redisManager.addLink(userId, urlValue, data);
        const links = await redisManager.getAllLinks(userId);
        res.send(links);
    } catch (error) {
        res.statusCode(500);
        res.send({message: 'Failed to save link', error});
    }
    next();
}

async function editLink(req, res, next) {
    try {
        const {keywords, urlValue, name, caption, isPrivate, favIconUrl, originalUrl} = req.body;
        const userId = req.params.id;
        await redisManager.removeLink(userId, originalUrl);
        const keywordsSplit = keywords.split(',');
        const data = {name, keywordsSplit, caption, isPrivate, favIconUrl};
        await redisManager.addLink(userId, urlValue, data);
        const links = await redisManager.getAllLinks(userId);
        res.send(links);
    } catch (error) {
        res.statusCode(500);
        res.send({message: 'Failed to save link', error});
    }
    next();
}

async function removeLink(req, res, next) {
    try {
        let {urlValue} = req.body;
        const userId = req.params.id;
        await redisManager.removeLink(userId, urlValue);
        const links = await redisManager.getAllLinks(userId);
        res.send(links);
    } catch (error) {
        res.statusCode(500);
        res.send({message: 'Failed to remove link', error});
    }
    next();
}

async function removeAllLinks(req, res, next) {
    try {
        const userId = req.params.id;
        await redisManager.removeAllLinks(userId);
        res.send({message: 'All links removed successfully'});
    } catch (error) {
        res.statusCode(500);
        res.send({message: 'Failed to remove all links', error});
    }
    next();
}

async function getAllLinks(req, res, next) {
    try {
        const userId = req.params.id;
        const links = await redisManager.getAllLinks(userId);
        res.send(links);
    } catch (error) {
        res.statusCode(500);
        res.send({message: 'Failed to get all links', error});
    }
    next();
}

async function getLink(req, res, next) {
    try {
        let {urlValue} = req.body;
        const userId = req.params.id;
        const link = await redisManager.getLink(userId, urlValue);
        res.send(link);
    } catch (error) {
        res.statusCode(500);
        res.send({message: 'Failed to get link', error});
    }
    next();
}

module.exports = {
    saveLink, editLink, removeLink, removeAllLinks, getAllLinks, getLink
}