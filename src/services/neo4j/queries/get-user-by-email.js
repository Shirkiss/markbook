const { props } = require('../helpers/consts');
const { CypherQuery, TRANSACTION_TYPE } = require('../base/cypher-query');

class GetUserByEmail extends CypherQuery {
  get required() {
    return ['email'];
  }

  static get metadataProps() {
    return ['email'];
  }

  static get transaction() {
    return TRANSACTION_TYPE.READ;
  }

  get transaction() {
    return TRANSACTION_TYPE.READ;
  }

  async perform(session, timeout, { email }) {
    const getGroupMembersQuery = `MATCH (user:${props.USER} { email: $email})
      RETURN properties(user) AS userInfo`;

    const txConfig = {
      timeout,
      metadata: {
        name: 'get-user-by-email',
        email,
      },
    };


    let value = null;
    await session[this.transactionType](async (tx) => {
      const { records } = await tx.run(getGroupMembersQuery, { email });
      [value] = records.map(record => record.toObject());
    }, txConfig);

    return { value };
  }
}

module.exports = new GetUserByEmail();
