const {props, relations, consts} = require('../helpers/consts');
const {CypherQuery, TRANSACTION_TYPE} = require('../base/cypher-query');

class SearchGroup extends CypherQuery {
    get required() {
        return ['userId', 'keyword'];
    }

    static get metadataProps() {
        return ['userId', 'keyword'];
    }

    get optional() {
        return ['maxResults', 'minKeywordLength'];
    }

    static get transaction() {
        return TRANSACTION_TYPE.READ;
    }

    get transaction() {
        return TRANSACTION_TYPE.READ;
    }

    async _getGroupsIds(txc, userId) {
        const getGroupQuery = `MATCH (:${props.USER} { id: $userId })-[:${relations.MEMBER_OF}]->(groups:${props.GROUP})
      RETURN collect(groups.id) AS groupsIds`;

        const results = await txc.run(getGroupQuery, {userId});

        const records = results.records.map(record => record.toObject());

        return records.length > 0
            ? records[0].groupsIds
            : null;
    }

    async _getIndexes(txc) {
        const results = await txc.run('CALL db.indexes');

        return results.records.map(record => record.toObject());
    }

    async createFullTextSearchIndex(txc) {
        const queries = [
            {
                name: 'group_search_fulltext',
                query: `CALL db.index.fulltext.createNodeIndex("group_search_fulltext",["${props.GROUP}"],["groupName"])`,
            }];

        const indexes = await this._getIndexes(txc);

        for (let i = 0; i < queries.length; i++) {
            const {name, query} = queries[i];
            const exists = indexes.findIndex(index => index.name === name) > -1;
            if (exists === false) {
                await txc.run(query);
            }
        }
    }

    async _searchGroup(txc, userId, keyword, maxResults) {
        await this.createFullTextSearchIndex(txc);
        const searchTerm = `*${keyword}*`;
        const query = `CALL db.index.fulltext.queryNodes('group_search_fulltext', $searchTerm, { limit: $maxResults }) YIELD node AS group
      OPTIONAL MATCH (user:${props.USER} { id: $userId })-[:${relations.FRIEND_OF}]-(friend:${props.USER})-[:${relations.MEMBER_OF}]->(group)
      WITH group, count(DISTINCT friend) AS friendsCount
      RETURN properties(group) AS groupProps, friendsCount
      ORDER BY friendsCount DESC`;

        const results = await txc.run(query, {userId, searchTerm, maxResults});

        return results.records.map(record => record.toObject());
    }

    async perform(session, timeout, {
        keyword,
        userId,
        maxResults = consts.GROUP_SEARCH_MAX_RESULTS,
        minKeywordLength = consts.GROUP_SEARCH_MIN_KEYWORD_LENGTH
    }) {
        if (keyword.length < minKeywordLength) {
            throw new Error('keyword length is too short.');
        }

        const txConfig = {
            timeout,
            metadata: {
                name: 'search-group',
                userId,
                keyword,
            },
        };

        const results = await session[this.transactionType](async (txc) => {
            const userGroupsIds = await this._getGroupsIds(txc, userId);

            const groups = await this._searchGroup(txc, userId, keyword, maxResults);

            // remove user's groups from groups array
            const finalGroups = groups.filter((group) => !userGroupsIds.includes(group));

            // eslint-disable-next-line no-magic-numbers
            if (finalGroups > -1) {
                groups.splice(finalGroups, 1);
            }

            return groups;
        }, txConfig);

        return {value: results};
    }
}

module.exports = new SearchGroup();
