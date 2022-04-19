const ElasticSearch = require('../services/elasticsearchManager');
const ELASTICSEARCH_LINKS_INDEX = 'links';

async function initClient(index) {
    const elasticSearch = new ElasticSearch(index);
    await elasticSearch.init();
    return elasticSearch;
}

async function saveLink(userId, data) {
    const elasticSearch = await initClient(ELASTICSEARCH_LINKS_INDEX);
    data['keywords'] = data.keywords.split(',');
    data.userId = userId;
    await elasticSearch.addLink(data);
}

async function editLink(userId, linkId, data) {
    const elasticSearch = await initClient(ELASTICSEARCH_LINKS_INDEX);
    data['keywords'] = data.keywords.split(',');
    data.userId = userId;
    await elasticSearch.editLink(linkId, data);
}

async function removeLink(linkId) {
    const elasticSearch = await initClient(ELASTICSEARCH_LINKS_INDEX);
    await elasticSearch.deleteById(linkId);
}

async function removeAllLinks(userId) {
    const elasticSearch = await initClient(ELASTICSEARCH_LINKS_INDEX);
    await elasticSearch.deleteByUserId(userId);
}

async function getLink(linkId) {
    const elasticSearch = await initClient(ELASTICSEARCH_LINKS_INDEX);
    return await elasticSearch.getById(linkId);
}

async function getAll(userId) {
    const elasticSearch = await initClient(ELASTICSEARCH_LINKS_INDEX);
    return await elasticSearch.getAll(userId);
}

module.exports = {saveLink, getAll, editLink, removeLink, removeAllLinks, getLink};

