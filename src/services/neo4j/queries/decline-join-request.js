const { props, relations } = require('../helpers/consts');
const { CypherQuery } = require('../base/cypher-query');
const common = require('../helpers/common');

class DeclineJoinRequest extends CypherQuery {
    get required() {
        return ['ownerId', 'groupId', 'userId'];
    }

    static get metadataProps() {
        return ['ownerId', 'groupId', 'userId'];
    }

    async perform(session, timeout, { ownerId, groupId, userId }) {
        const txConfig = {
            timeout,
            metadata: {
                name: 'decline-member',
                userId,
                groupId,
                ownerId,
            },
        };

        let err = null;
        let value = null;

        await session.writeTransaction(async (txc) => {
            const checkingUserIsOwner = await common.checkUserIsOwner(txc, ownerId, groupId);
            if (!checkingUserIsOwner) {
                err = 'NOT_OWNER';
            } else {
                value = await this._declineMember(txc, userId, groupId);
            }
        }, txConfig);

        return { value, err };
    }

    async _declineMember(txc, userId, groupId) {
        await txc.run(
            `MATCH (group:${props.GROUP} { id: $groupId })<-[joinRequest:${relations.REQUEST_JOIN_TO}]-(user:${props.USER} { id: $userId })
      MERGE (user)-[declinedRequest:${relations.REJECTED_FROM}]->(group)
      DELETE joinRequest`,
            { userId, groupId },
        );

        return 'Success';
    }
}

module.exports = new DeclineJoinRequest();
