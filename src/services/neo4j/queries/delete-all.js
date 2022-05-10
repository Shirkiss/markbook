const {CypherQuery} = require('../base/cypher-query');

class DeleteAll extends CypherQuery {
    get required() {
        return [];
    }

    static get metadataProps() {
        return [];
    }

    generateQuery(params = {}) {
        const query = `MATCH (n)
                    DETACH DELETE n`;
        return {query, params};
    }
}

module.exports = new DeleteAll();
