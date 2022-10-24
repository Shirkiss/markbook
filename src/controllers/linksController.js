const elasticsearchManager = require('../services/elasticsearchManager');
const ELASTICSEARCH_LINKS_INDEX = 'links';
const getFavicons = require('get-website-favicon');
const {getFaviconFromUrl} = require('../services/services');

async function addGroupsLink(userId, data, groups) {
    groups = groups.split(',');
    for (let i = 0; i < groups.length; ++i) {
        data.groupId = groups[i];
        const linkId = `${userId}:${data.urlValue}:${data.groupId}`;
        await elasticsearchManager.addDocumentWithId(linkId, data, ELASTICSEARCH_LINKS_INDEX);
    }
}

async function prepareDataAndAddLink(userId, data) {
    data.keywords = data.keywords?.split(',');
    data.userId = data.userId ?? userId;
    data.clicksCounter = data.clicksCounter ?? 0;
    data.usersWhoClicked = data.usersWhoClicked ?? [userId];
    const linkId = `${userId}:${data.urlValue}`;
    const groups = data.groups;
    data.groups = undefined;
    await elasticsearchManager.addDocumentWithId(linkId, data, ELASTICSEARCH_LINKS_INDEX);
    if (groups) await addGroupsLink(userId, data, groups);
}

async function saveLink(req, res, next) {
    try {
        const {userId} = req.params;
        const data = req.body;
        await prepareDataAndAddLink(userId, data);
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
            await prepareDataAndAddLink(userId, data);
        }
        const links = await elasticsearchManager.getAll(userId, ELASTICSEARCH_LINKS_INDEX);
        res.send(links);
    } catch (error) {
        res.status(500).send({message: 'Failed to save links', error});
    }
    next();
}

async function getFavicon(data) {
    await getFavicons(data.urlValue).then(favData => {
        let faviconUrl = favData['icons']?.[0]?.['src'];
        if (!faviconUrl) {
            faviconUrl = getFaviconFromUrl(data.urlValue);
        }
        data.favIconUrl = faviconUrl;
    });
}

async function addFaviconAndSaveLinks(req, res, next) {
    try {
        const {userId} = req.params;
        const linksArray = JSON.parse(req.body['linksArray']);
        for (let i = 0; i < linksArray.length; ++i) {
            let data = linksArray[i];
            await getFavicon(data);
            await prepareDataAndAddLink(userId, data);
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
        await prepareDataAndAddLink(userId, data);
        const links = await elasticsearchManager.getAll(userId, ELASTICSEARCH_LINKS_INDEX);
        res.send(links);
    } catch (error) {
        res.status(500).send({message: 'Failed to edit link', error});
    }
    next();
}

async function linkClicked(req, res, next) {
    try {
        const {userId} = req.params;
        const {linkId} = req.body;
        await elasticsearchManager.increaseClicksCounter(linkId, ELASTICSEARCH_LINKS_INDEX);
        await elasticsearchManager.userClickedOnLink(linkId, userId, ELASTICSEARCH_LINKS_INDEX);
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

async function getMostClickedLinks(req, res, next) {
    try {
        const {userId} = req.params;
        const {from, size} = req.body;
        const links = await elasticsearchManager.getUserDocumentsByHighestClicksCounter(userId, ELASTICSEARCH_LINKS_INDEX, from, size);
        res.send(links);
    } catch (error) {
        res.status(500).send({message: 'Failed to get user documents by highest clicks counter', error});
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
        const {from} = req.body;
        const links = await elasticsearchManager.getAll(userId, ELASTICSEARCH_LINKS_INDEX, from);
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
    saveLink,
    editLink,
    deleteLink,
    deleteAllLinks,
    getAllLinks,
    getLink,
    searchAll,
    saveLinks,
    addFaviconAndSaveLinks,
    linkClicked,
    getMostClickedLinks
}