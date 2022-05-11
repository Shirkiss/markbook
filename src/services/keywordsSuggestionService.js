const elasticSearch = require("./elasticsearchManager");

const NUMBER_OF_INITIAL_KEYWORDS_SUGGESTIONS = 4;
const NUMBER_OF_KEYWORDS_SUGGESTIONS = 20;


const getKeywordsSuggestion = async (userId, prefix, index) => {
    let keywords = [];
    const userCommonKeywords = await elasticSearch.mostFrequentKeywordForUserByPrefix(userId, prefix, NUMBER_OF_KEYWORDS_SUGGESTIONS, index);
    if (userCommonKeywords) {
        keywords = getKeysFromResponse(userCommonKeywords);
    }
    if (keywords.length < NUMBER_OF_KEYWORDS_SUGGESTIONS) {
        const generalCommonKeywords = await elasticSearch.mostFrequentKeywordByPrefix(prefix, NUMBER_OF_KEYWORDS_SUGGESTIONS - keywords.length, index);
        let result = getKeysFromResponse(generalCommonKeywords);
        keywords = keywords.concat(result);
    }

    return keywords;
}

const getGeneralKeywordsSuggestion = async (userId, prefix, limit, index) => {
    let keywords = [];
    const userCommonKeywords = await elasticSearch.mostFrequentKeywordForUserByPrefix(userId, prefix, limit, index);
    if (userCommonKeywords) {
        keywords = getKeysFromResponse(userCommonKeywords);
    }
    if (keywords.length < limit) {
        const generalCommonKeywords = await elasticSearch.mostFrequentKeywordByPrefix(prefix, limit - keywords.length, index);
        let result = getKeysFromResponse(generalCommonKeywords);
        keywords = keywords.concat(result);
    }

    return keywords;
}

const getInitialKeywordsSuggestion = async (userId, index) => {
    let keywords = [];
    const userCommonKeywords = await elasticSearch.mostFrequentKeywordForUser(userId, NUMBER_OF_INITIAL_KEYWORDS_SUGGESTIONS, index);
    if (userCommonKeywords) {
        keywords = getKeysFromResponse(userCommonKeywords);
    }
    if (keywords.length < NUMBER_OF_INITIAL_KEYWORDS_SUGGESTIONS) {
        const generalCommonKeywords = await elasticSearch.mostFrequentKeyword(NUMBER_OF_INITIAL_KEYWORDS_SUGGESTIONS - keywords.length, index);
        let result = getKeysFromResponse(generalCommonKeywords);
        keywords = keywords.concat(result);
    }

    return keywords;
}

const getKeysFromResponse = (response) => {
    return response.map(link => link.key);
}

module.exports = {getInitialKeywordsSuggestion, getKeywordsSuggestion, getGeneralKeywordsSuggestion}

