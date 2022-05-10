const { props, relations } = require('../helpers/consts');
const { CypherQuery, EXECUTION_MODE } = require('../base/cypher-query');

class GetUserPendingJoinRequests extends CypherQuery {
  get required() {
    return ['userId'];
  }

  static get metadataProps() {
    return ['userId'];
  }

  static get executionMode() {
    return EXECUTION_MODE.SEQUENTIAL;
  }

  generateQuery(params = {}) {
    const query = `MATCH (user:${props.USER} { id: $userId })
    OPTIONAL MATCH (user)-[:${relations.REQUEST_JOIN_TO}]->(group)
    WHERE group IS NOT NULL
    WITH collect(group.id) as requestedGroupIds
    WHERE requestedGroupIds IS NOT NULL
    RETURN requestedGroupIds`;

    return [{ query, params }];
  }
}

module.exports = new GetUserPendingJoinRequests();
