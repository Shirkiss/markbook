const elasticsearchManager = require('../services/elasticsearchManager');
const ELASTICSEARCH_LINKS_INDEX = 'links';
const getFavicons = require('get-website-favicon');
const {getFaviconFromUrl} = require('../services/services');

async function saveLink(req, res, next) {
    try {
        const {userId} = req.params;
        const data = req.body;
        data['keywords'] = data.keywords.split(',');
        data.userId = userId;
        const linkId = `${userId}:${data.urlValue}`;
        await elasticsearchManager.addDocumentWithId(linkId, data, ELASTICSEARCH_LINKS_INDEX);
        const links = await elasticsearchManager.getAll(userId, ELASTICSEARCH_LINKS_INDEX);
        res.send(links);
    } catch (error) {
        res.status(500).send({message: 'Failed to save link', error});
    }
    next();
}

async function saveLinks(req, res, next) {
    try {
        const {userId} = req.params;
        const linksArray = JSON.parse(req.body['linksArray']);
        for (let i = 0; i < linksArray.length; ++i) {
            let data = linksArray[i];
            data.userId = userId;
            const linkId = `${userId}:${data.urlValue}`;
            await elasticsearchManager.addDocumentWithId(linkId, data, ELASTICSEARCH_LINKS_INDEX);
        }
        const links = await elasticsearchManager.getAll(userId, ELASTICSEARCH_LINKS_INDEX);
        res.send(links);
    } catch (error) {
        res.status(500).send({message: 'Failed to save links', error});
    }
    next();
}

async function addFaviconAndSaveLinks(req, res, next) {
    try {
        const {userId} = req.params;
        const linksArray = JSON.parse(req.body['linksArray']);
        for (let i = 0; i < linksArray.length; ++i) {
            let data = linksArray[i];
            data.userId = userId;
            await getFavicons(data.urlValue).then(favData => {
                let faviconUrl = favData['icons']?.[0]?.['src'];
                if (!faviconUrl) {
                    faviconUrl = getFaviconFromUrl(data.urlValue);
                }
                data.favIconUrl = faviconUrl;
            });
            const linkId = `${userId}:${data.urlValue}`;
            await elasticsearchManager.addDocumentWithId(linkId, data, ELASTICSEARCH_LINKS_INDEX);
        }
        const links = await elasticsearchManager.getAll(userId, ELASTICSEARCH_LINKS_INDEX);
        res.send(links);
    } catch (error) {
        res.status(500).send({message: 'Failed to add favicon and save links', error});
    }
    next();
}

async function editLink(req, res, next) {
    try {
        const {userId} = req.params;
        const data = req.body;
        data['keywords'] = data.keywords.split(',');
        data.userId = userId;
        const linkId = `${userId}:${data.urlValue}`;
        await elasticsearchManager.editDocument(linkId, data, ELASTICSEARCH_LINKS_INDEX);
        const links = await elasticsearchManager.getAll(userId, ELASTICSEARCH_LINKS_INDEX);
        res.send(links);
    } catch (error) {
        res.status(500).send({message: 'Failed to edit link', error});
    }
    next();
}

async function deleteLink(req, res, next) {
    try {
        const {userId} = req.params;
        const {linkId} = req.body;
        await elasticsearchManager.deleteById(linkId, ELASTICSEARCH_LINKS_INDEX)
        const links = await elasticsearchManager.getAll(userId, ELASTICSEARCH_LINKS_INDEX);
        res.send(links);
    } catch (error) {
        res.status(500).send({message: 'Failed to delete link', error});
    }
    next();
}

async function searchAll(req, res, next) {
    try {
        const {userId} = req.params;
        const {prefix} = req.body;
        const links = await elasticsearchManager.prefixSearchAllFields(prefix, userId, ELASTICSEARCH_LINKS_INDEX);
        res.send(links);
    } catch (error) {
        res.status(500).send({message: 'Failed to search', error});
    }
    next();
}

async function deleteAllLinks(req, res, next) {
    try {
        const {userId} = req.params;
        await elasticsearchManager.deleteByUserId(userId, ELASTICSEARCH_LINKS_INDEX);
        res.send({message: 'All links deleted successfully'});
    } catch (error) {
        res.status(500).send({message: 'Failed to delete all links', error});
    }
    next();
}

async function getAllLinks(req, res, next) {
    try {
        const {userId} = req.params;
        const links = await elasticsearchManager.getAll(userId, ELASTICSEARCH_LINKS_INDEX);
        res.send(links);
    } catch (error) {
        res.status(500).send({message: 'Failed to get all links', error});
    }
    next();
}

async function getLink(req, res, next) {
    try {
        const {linkId} = req.params;
        const link = await elasticsearchManager.getById(linkId, ELASTICSEARCH_LINKS_INDEX);
        res.send(link);
    } catch (error) {
        res.status(500).send({message: 'Failed to get link', error});
    }
    next();
}

module.exports = {
    saveLink, editLink, deleteLink, deleteAllLinks, getAllLinks, getLink, searchAll, saveLinks, addFaviconAndSaveLinks
}