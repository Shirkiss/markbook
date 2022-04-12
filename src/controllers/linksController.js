const redisManager = require('../services/redisManager');
const elasticSearchController = require('./elasticsearchController');

async function saveLink(req, res, next) {
    try {
        const userId = req.params.userId;
        await elasticSearchController.saveLink(req.body, userId);
        const links = await elasticSearchController.getAll(userId);
        res.send(links);
    } catch (error) {
        res.statusCode(500);
        res.send({message: 'Failed to save link', error});
    }
    next();
}

async function editLink(req, res, next) {
    try {
        const {userId, linkId} = req.params;
        await elasticSearchController.editLink(userId, linkId, req.body);
        const links = await elasticSearchController.getAll(userId);
        res.send(links);
    } catch (error) {
        res.statusCode(500);
        res.send({message: 'Failed to save link', error});
    }
    next();
}

async function removeLink(req, res, next) {
    try {
        const {userId, linkId} = req.params;
        await elasticSearchController.removeLink(linkId);
        const links = await elasticSearchController.getAll(userId);
        res.send(links);
    } catch (error) {
        res.statusCode(500);
        res.send({message: 'Failed to remove link', error});
    }
    next();
}

async function removeAllLinks(req, res, next) {
    try {
        const {userId} = req.params;
        await elasticSearchController.removeAllLinks(userId);
        res.send({message: 'All links removed successfully'});
    } catch (error) {
        res.statusCode(500);
        res.send({message: 'Failed to remove all links', error});
    }
    next();
}

async function getAllLinks(req, res, next) {
    try {
        const {userId} = req.params;
        const links = await elasticSearchController.getAll(userId);
        res.send(links);
    } catch (error) {
        res.statusCode(500);
        res.send({message: 'Failed to get all links', error});
    }
    next();
}

async function getLink(req, res, next) {
    try {
        const {linkId} = req.params;
        const link = await elasticSearchController.getLink(linkId);
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