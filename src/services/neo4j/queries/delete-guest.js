const {props} = require('../helpers/consts');
const {CypherQuery} = require('../base/cypher-query');

class DeleteGuest extends CypherQuery {
    get required() {
        return ['guestEmail'];
    }

    static get metadataProps() {
        return ['guestEmail'];
    }

    async perform(session, timeout, {guestEmail}) {
        let value = false;

        const txConfig = {
            timeout,
            metadata: {
                name: 'delete-guest',
                guestEmail,
            },
        };

        await session.writeTransaction(async (txc) => {
            const userDeleteQuery = `MATCH (guest:${props.GUEST} { email: $guestEmail })
        DETACH DELETE guest
        RETURN count(guest) as deletedCount`;

            const {deletedCount} = await txc.run(userDeleteQuery, {guestEmail});


            value = deletedCount > 0;
        }, txConfig);

        return {value};
    }
}

module.exports = new DeleteGuest();
