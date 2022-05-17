const { props } = require('../helpers/consts');
const { CypherQuery, TRANSACTION_TYPE } = require('../base/cypher-query');

class getGroupLinks extends CypherQuery {
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
    const getGroupMembersQuery = `MATCH (group:${props.GROUP} { id: $groupId })
      RETURN group.links AS groupLinks`;

    const txConfig = {
      timeout,
      metadata: {
        name: 'get-group-links',
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

module.exports = new getGroupLinks();
