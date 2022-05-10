const { props, relations } = require('../helpers/consts');
const { CypherQuery, TRANSACTION_TYPE } = require('../base/cypher-query');

class GetUserGroups extends CypherQuery {
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
    const getGroupMembersQuery = `MATCH (groups:${props.GROUP})<-[:${relations.MEMBER_OF}]-(user:${props.USER} { id: $userId })
      RETURN collect(properties(groups)) AS groups`;

    const txConfig = {
      timeout,
      metadata: {
        name: 'get-user-groups',
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

module.exports = new GetUserGroups();
