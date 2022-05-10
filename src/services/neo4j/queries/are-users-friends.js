const { props, relations } = require('../helpers/consts');
const { CypherQuery, TRANSACTION_TYPE } = require('../base/cypher-query');

class AreUsersFriends extends CypherQuery {
  get required() {
    return ['userId', 'anotherUserId'];
  }

  static get metadataProps() {
    return ['userId', 'anotherUserId'];
  }

  static get transaction() {
    return TRANSACTION_TYPE.READ;
  }

  get transaction() {
    return TRANSACTION_TYPE.READ;
  }

  generateQuery(params = {}) {
    const query = `OPTIONAL MATCH (u1:${props.USER} { id: $userId })-[friendship:${relations.FRIEND_OF}]-(u2:${props.USER} { id: $anotherUserId })
      RETURN CASE WHEN friendship IS NOT NULL THEN true ELSE false END`;
    return { query, params };
  }
}

module.exports = new AreUsersFriends();
