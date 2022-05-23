const {props, relations, consts} = require('../helpers/consts');
const {CypherQuery, EXECUTION_MODE} = require('../base/cypher-query');


class InviteGuestToGroup extends CypherQuery {
    get required() {
        return ['guestEmail', 'groupId'];
    }

    static get metadataProps() {
        return ['guestEmail', 'groupId'];
    }

    get optional() {
        return [];
    }

    static get executionMode() {
        return EXECUTION_MODE.SEQUENTIAL;
    }


    async _inviteToGroup(txc, guestEmail, groupId) {
        const {records} = await txc.run(
            `MATCH (group:${props.GROUP} { id: $groupId })
            MERGE (guest:${props.GUEST} { email: $guestEmail })
      MERGE (guest)- [:${relations.INVITED_TO}]->(group)
      RETURN properties(group) AS groupProps`,
            {guestEmail, groupId},
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
        groupId
    }) {
        let err = null;
        let value = null;

        const txConfig = {
            timeout,
            metadata: {
                name: 'invite-guest-to-group',
                guestEmail,
                groupId,
            },
        };

        await session.writeTransaction(async (txc) => {
            const userExists = await this.checkIsUserExists(txc, guestEmail);
            if (userExists) {
                err = 'NOT_GUEST';
            } else {
                const {groupProps} = await this._inviteToGroup(txc, guestEmail, groupId);

                // build final result
                value = {
                    groupProps,
                    guestEmail,
                    status: consts.status.INVITED,
                };
            }

        }, txConfig);

        return {value, err};
    }
}

module.exports = new InviteGuestToGroup();
