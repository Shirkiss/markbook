const { props, relations } = require('../helpers/consts');
const { CypherQuery, TRANSACTION_TYPE } = require('../base/cypher-query');

class GetUserFriends extends CypherQuery {
  get required() {
    return ['userId'];
  }

  static get metadataProps() {
    return ['userId'];
  }

  static get transaction() {
    return TRANSACTION_TYPE.READ;
  }

  get transaction() {
    return TRANSACTION_TYPE.READ;
  }

  async perform(session, timeout, { userId }) {
    const getGroupMembersQuery = `MATCH (friends:${props.USER})-[:${relations.FRIEND_OF}]-(user:${props.USER} { id: $userId })
      RETURN collect(properties(friends)) AS friends`;

    const txConfig = {
      timeout,
      metadata: {
        name: 'get-user-friends',
        userId,
      },
    };


    let value = null;
    await session[this.transactionType](async (tx) => {
      const { records } = await tx.run(getGroupMembersQuery, { userId });
      [value] = records.map(record => record.toObject());
    }, txConfig);

    return { value };
  }
}

module.exports = new GetUserFriends();
