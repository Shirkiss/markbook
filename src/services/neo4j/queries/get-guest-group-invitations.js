const { props, relations } = require('../helpers/consts');
const { CypherQuery, EXECUTION_MODE } = require('../base/cypher-query');

class GetGuestGroupInvitations extends CypherQuery {
  get required() {
    return ['guestEmail'];
  }

  static get metadataProps() {
    return ['guestEmail'];
  }

  static get executionMode() {
    return EXECUTION_MODE.SEQUENTIAL;
  }

  generateQuery(params = {}) {
    const query = `MATCH (guest:${props.GUEST} { email: $guestEmail })
    OPTIONAL MATCH (guest)-[:${relations.INVITED_TO}]->(group)
    WHERE group IS NOT NULL
    WITH collect(group.id) as requestedGroupIds
    WHERE requestedGroupIds IS NOT NULL
    RETURN requestedGroupIds`;

    return [{ query, params }];
  }
}

module.exports = new GetGuestGroupInvitations();
