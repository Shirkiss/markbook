const { props } = require('../helpers/consts');
const { CypherQuery } = require('../base/cypher-query');

class CreateUser extends CypherQuery {
    get required() {
        return ['userId'];
    }

    static get metadataProps() {
        return ['userId'];
    }

    get optional() {
        return ['name', 'image', 'country', 'id'];
    }

    async perform(session, timeout, ...args) {
        const [params] = args;
        const {userId} = params;

        // TODO: add encryption for user data
        const txConfig = {
            timeout,
            metadata: {
                name: 'create-user',
            },
        };

        await session.writeTransaction(async (txc) => {
            await txc.run(`
        MERGE (user:${props.USER} { id: $userId })
        ON CREATE SET user.createdAt = timestamp()
        RETURN 'SUCCESS'`,
                { userId });

        }, txConfig);

        return { records: ['Success'] };
    }
}

module.exports = new CreateUser();
