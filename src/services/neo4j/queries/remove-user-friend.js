const { props, relations } = require('../helpers/consts');
const { CypherQuery } = require('../base/cypher-query');

class RemoveUserFriend extends CypherQuery {
  get required() {
    return ['userId', 'friendId'];
  }

  static get metadataProps() {
    return ['userId'];
  }

  generateQuery(params = {}) {
    const { userId, friendId } = params;
    const finalParams = {
      userId,
      friendId,
    };

    const query = `MATCH (user:${props.USER} { id: $userId })
      MATCH (user)-[friendship:${relations.FRIEND_OF}]-(friend:${props.USER} { id: $friendId } )
      DELETE friendship
      RETURN 'Success'`;
    return { query, params: finalParams };
  }
}

module.exports = new RemoveUserFriend();
