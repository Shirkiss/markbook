const {consts} = require('../helpers/consts');
const {CypherQuery, EXECUTION_MODE} = require('../base/cypher-query');
const common = require('../helpers/common');

class ApproveJoinRequest extends CypherQuery {
    get required() {
        return ['ownerId', 'groupId', 'userId'];
    }

    static get executionMode() {
        return EXECUTION_MODE.SEQUENTIAL;
    }

    static get metadataProps() {
        return ['ownerId', 'groupId', 'userId'];
    }


    async perform(session, timeout, {ownerId, groupId, userId}) {
        let err = null;
        let value = null;

        const txConfig = {
            timeout,
            metadata: {
                name: 'approve-join-request',
                userId,
                groupId,
            },
        };

        await session.writeTransaction(async (txc) => {
            const leaderId = await common.getGroupLeaderId(txc, groupId);

            if (ownerId !== leaderId) {
                err = 'NOT_OWNER';
            } else {
                const pendingJoinRequestExist = await common.checkPendingRequestExists(txc, userId, groupId);

                if (pendingJoinRequestExist === false) {
                    err = 'NO_PENDING_REQUEST';
                } else {
                    const {groupProps} = await common.joinGroup(txc, userId, groupId);
                    await common.removeUserJoinRequests(txc, userId);

                    // build final result
                    value = {
                        groupProps,
                        status: consts.status.MEMBER,
                    };
                }
            }
        }, txConfig);

        return {value, err};
    }
}

module.exports = new ApproveJoinRequest();
