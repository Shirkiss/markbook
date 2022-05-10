const { props, relations } = require('../helpers/consts');
const { CypherQuery, EXECUTION_MODE } = require('../base/cypher-query');

class GetUserFriendsOnGroup extends CypherQuery {
  get required() {
    return ['userId', 'groupId'];
  }

  static get metadataProps() {
    return ['userId', 'groupId'];
  }

  static get executionMode() {
    return EXECUTION_MODE.SEQUENTIAL;
  }

  generateQuery(params = {}) {
    const query = `MATCH (user:${props.USER} { id: $userId })
     MATCH (user)-[:${relations.FRIEND_OF}]-(friends)-[:${relations.MEMBER_OF}]->(group:${props.GROUP} {id: $groupId})
    WHERE friends IS NOT NULL
    WITH collect(friends.id) as userFriendsOnGroup
    WHERE userFriendsOnGroup IS NOT NULL
    RETURN userFriendsOnGroup`;

    return [{ query, params }];
  }
}

module.exports = new GetUserFriendsOnGroup();
