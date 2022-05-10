const { props, relations } = require('../helpers/consts');
const { CypherQuery, TRANSACTION_TYPE } = require('../base/cypher-query');

class GetGroupMembers extends CypherQuery {
  get required() {
    return ['groupId'];
  }

  static get metadataProps() {
    return ['groupId'];
  }

  static get transaction() {
    return TRANSACTION_TYPE.READ;
  }

  get transaction() {
    return TRANSACTION_TYPE.READ;
  }

  async perform(session, timeout, { groupId }) {
    const getGroupMembersQuery = `MATCH (members:${props.USER})-[:${relations.MEMBER_OF}]->(group:${props.GROUP} { id: $groupId })
      RETURN collect(properties(members)) AS members`;

    const txConfig = {
      timeout,
      metadata: {
        name: 'get-group-members',
        groupId,
      },
    };


    let value = null;
    await session[this.transactionType](async (tx) => {
      const { records } = await tx.run(getGroupMembersQuery, { groupId });
      [value] = records.map(record => record.toObject());
    }, txConfig);

    return { value };
  }
}

module.exports = new GetGroupMembers();
