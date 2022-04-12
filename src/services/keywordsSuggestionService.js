const ElasticSearch = require("./elasticsearchManager");
const elasticSearchClient = new ElasticSearch();

const NUMBER_OF_INITIAL_KEYWORDS_SUGGESTIONS = 4;
const NUMBER_OF_KEYWORDS_SUGGESTIONS = 20;


const getKeywordsSuggestion = async (userId, prefix) => {
    let keywords = [];
    const userCommonKeywords = await elasticSearchClient.mostFrequentKeywordForUserByPrefix(userId, prefix, NUMBER_OF_KEYWORDS_SUGGESTIONS);
    if (userCommonKeywords) {
        keywords = getKeysFromResponse(userCommonKeywords);
    }
    if (keywords.length < NUMBER_OF_KEYWORDS_SUGGESTIONS) {
        const generalCommonKeywords = await elasticSearchClient.mostFrequentKeywordByPrefix(prefix, NUMBER_OF_KEYWORDS_SUGGESTIONS - keywords.length);
        let result = getKeysFromResponse(generalCommonKeywords);
        keywords = keywords.concat(result);
    }

    return keywords;

}
const getGeneralKeywordsSuggestion = async (userId, prefix, limit) => {
    let keywords = [];
    const userCommonKeywords = await elasticSearchClient.mostFrequentKeywordForUserByPrefix(userId, prefix, limit);
    if (userCommonKeywords) {
        keywords = getKeysFromResponse(userCommonKeywords);
    }
    if (keywords.length < limit) {
        const generalCommonKeywords = await elasticSearchClient.mostFrequentKeywordByPrefix(prefix, limit - keywords.length);
        let result = getKeysFromResponse(generalCommonKeywords);
        keywords = keywords.concat(result);
    }

    return keywords;
}

const getInitialKeywordsSuggestion = async (userId) => {
    let keywords = [];
    const userCommonKeywords = await elasticSearchClient.mostFrequentKeywordForUser(userId, NUMBER_OF_INITIAL_KEYWORDS_SUGGESTIONS);
    if (userCommonKeywords) {
        keywords = getKeysFromResponse(userCommonKeywords);
    }
    if (keywords.length < NUMBER_OF_INITIAL_KEYWORDS_SUGGESTIONS) {
        const generalCommonKeywords = await elasticSearchClient.mostFrequentKeyword(NUMBER_OF_INITIAL_KEYWORDS_SUGGESTIONS - keywords.length);
        let result = getKeysFromResponse(generalCommonKeywords);
        keywords = keywords.concat(result);
    }

    return keywords;
}

const getKeysFromResponse = (response) => {
    return response.map(link => link.key);
}

module.exports = {getInitialKeywordsSuggestion, getKeywordsSuggestion, getGeneralKeywordsSuggestion}

