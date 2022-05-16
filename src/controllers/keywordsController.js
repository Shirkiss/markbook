const keywordsSuggestionService = require('../services/keywordsSuggestionService');
const ELASTICSEARCH_LINKS_INDEX = 'links';

async function getInitialKeywordsSuggestion(req, res, next) {
    try {
        const {userId} = req.params;
        const keywords = await keywordsSuggestionService.getInitialKeywordsSuggestion(userId, ELASTICSEARCH_LINKS_INDEX);
        res.send(keywords);
    } catch (error) {
        res.status(500).send({message: 'Failed to send initial keywords suggestion', error});
    }
    next();
}

async function getKeywordsSuggestion(req, res, next) {
    try {
        const {userId, prefix} = req.params;
        const keywords = prefix ? await keywordsSuggestionService.getKeywordsSuggestion(userId, prefix, ELASTICSEARCH_LINKS_INDEX)
            : await keywordsSuggestionService.getInitialKeywordsSuggestion(userId, ELASTICSEARCH_LINKS_INDEX);
        res.send(keywords);
    } catch (error) {
        res.status(500).send({message: 'Failed to send keywords suggestion', error});
    }
    next();
}


module.exports = {
    getInitialKeywordsSuggestion,
    getKeywordsSuggestion
}