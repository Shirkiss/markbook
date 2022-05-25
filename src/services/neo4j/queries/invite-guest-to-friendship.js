const {props, relations, consts} = require('../helpers/consts');
const {CypherQuery, EXECUTION_MODE} = require('../base/cypher-query');


class InviteGuestToFriendship extends CypherQuery {
    get required() {
        return ['guestEmail', 'userId'];
    }

    static get metadataProps() {
        return ['guestEmail', 'userId'];
    }

    get optional() {
        return [];
    }

    static get executionMode() {
        return EXECUTION_MODE.SEQUENTIAL;
    }


    async _inviteToFriendship(txc, guestEmail, userId) {
        const {records} = await txc.run(
            `MATCH (user:${props.USER} { id: $userId })
            MERGE (guest:${props.GUEST} { email: $guestEmail })
      MERGE (user)-[:${relations.PENDING_FRIENDSHIP}]-(guest)
      RETURN properties(user) AS userProps`,
            {guestEmail, userId},
        );

        const recordObjects = records.map(record => record.toObject());

        if (recordObjects.length === 0) {
            // throw error
        }

        return recordObjects[0];
    }

    async checkIsUserExists(txc, guestEmail) {
        const results = await txc.run(
            `MATCH (user:${props.USER} { email: $guestEmail })
      RETURN user.id AS userId`,
            { guestEmail },
        );

        return results.records.length === 1;
    }



    async perform(session, timeout, {
        guestEmail,
        userId
    }) {
        let err = null;
        let value = null;

        const txConfig = {
            timeout,
            metadata: {
                name: 'invite-guest-to-friendship',
                guestEmail,
                userId,
            },
        };

        await session.writeTransaction(async (txc) => {
            const userExists = await this.checkIsUserExists(txc, guestEmail);
            if (userExists) {
                err = 'NOT_GUEST';
            } else {
                const {userProps} = await this._inviteToFriendship(txc, guestEmail, userId);

                // build final result
                value = {
                    userProps,
                    guestEmail,
                    status: consts.status.INVITED,
                };
            }

        }, txConfig);

        return {value, err};
    }
}

module.exports = new InviteGuestToFriendship();
