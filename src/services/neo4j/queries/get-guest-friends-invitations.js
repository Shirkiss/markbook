const { props, relations } = require('../helpers/consts');
const { CypherQuery, EXECUTION_MODE } = require('../base/cypher-query');

class getGuestFriendsInvitations extends CypherQuery {
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
    OPTIONAL MATCH (guest)-[:${relations.PENDING_FRIENDSHIP}]-(user)
    WHERE user IS NOT NULL
    WITH collect(user.id) as requestedUserIds
    WHERE requestedUserIds IS NOT NULL
    RETURN requestedUserIds`;

    return [{ query, params }];
  }
}

module.exports = new getGuestFriendsInvitations();
