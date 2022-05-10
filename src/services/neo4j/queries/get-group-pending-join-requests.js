const {relations} = require('../helpers/consts');
const {CypherQuery, EXECUTION_MODE} = require('../base/cypher-query');
const common = require('../helpers/common');

class GetGroupPendingJoinRequests extends CypherQuery {
    get required() {
        return ['ownerId', 'groupId'];
    }

    static get metadataProps() {
        return ['ownerId', 'groupId'];
    }

    static get executionMode() {
        return EXECUTION_MODE.SEQUENTIAL;
    }

    async _getPendingJoinRequestQuery(txc, ownerId, groupId) {
        const {records} = await txc.run(
            `OPTIONAL MATCH (group)<-[r:${relations.REQUEST_JOIN_TO}]-(users) 
    WHERE users IS NOT NULL
    WITH collect(users) as joinRequests
    WHERE joinRequests IS NOT NULL
    RETURN joinRequests AS result`,
            {ownerId, groupId},
        );

        const recordObjects = records.map(record => record.toObject());

        return recordObjects[0]['result'];
    }

    async perform(session, timeout, {ownerId, groupId}) {
        const txConfig = {
            timeout,
            metadata: {
                name: 'get-pending-join-requests',
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
                value = await this._getPendingJoinRequestQuery(txc, ownerId, groupId);
            }
        }, txConfig);

        return {value, err};
    }
}

module.exports = new GetGroupPendingJoinRequests();
