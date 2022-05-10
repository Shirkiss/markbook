const { props, relations } = require('../helpers/consts');
const { CypherQuery } = require('../base/cypher-query');

class DeleteGroup extends CypherQuery {
    get required() {
        return ['ownerId', 'groupId'];
    }

    static get metadataProps() {
        return ['ownerId', 'groupId'];
    }

    generateQuery(params = {}) {
        const query = `MATCH (group:${props.GROUP} { id: $groupId })-[rel:${relations.LEAD_BY}]->(:${props.USER} { id: $ownerId })
      DETACH DELETE group 
      RETURN 'Success'`;
        return { query, params };
    }
}

module.exports = new DeleteGroup();
