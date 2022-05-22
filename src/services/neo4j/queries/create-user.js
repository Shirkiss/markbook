const { props } = require('../helpers/consts');
const { CypherQuery } = require('../base/cypher-query');

class CreateUser extends CypherQuery {
    get required() {
        return ['userId', 'email'];
    }

    static get metadataProps() {
        return ['userId', 'email'];
    }

    get optional() {
        return ['name', 'image', 'country', 'id'];
    }

    async perform(session, timeout, ...args) {
        const [params] = args;
        const {userId, email} = params;

        // TODO: add encryption for user data
        const txConfig = {
            timeout,
            metadata: {
                name: 'create-user',
            },
        };

        await session.writeTransaction(async (txc) => {
            await txc.run(`
        MERGE (user:${props.USER} { id: $userId, email: $email })
        ON CREATE SET user.createdAt = timestamp()
        RETURN 'SUCCESS'`,
                { userId, email });

        }, txConfig);

        return { records: ['Success'] };
    }
}

module.exports = new CreateUser();
