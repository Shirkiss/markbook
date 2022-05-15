const {props, relations, consts} = require('../helpers/consts');
const {CypherQuery, EXECUTION_MODE} = require('../base/cypher-query');
const common = require('../helpers/common');


class JoinGroup extends CypherQuery {
    get required() {
        return ['groupId', 'userId'];
    }

    static get metadataProps() {
        return ['groupId', 'userId'];
    }

    get optional() {
        return [];
    }

    static get executionMode() {
        return EXECUTION_MODE.SEQUENTIAL;
    }

    // TODO: Add cleanup for expired connections

    async _joinClosedGroup(txc, userId, groupId) {
        const {records} = await txc.run(
            `MATCH (user:${props.USER} { id: $userId })
      MATCH (group:${props.GROUP} { id: $groupId })
      MERGE (user)- [joinRequest:${relations.REQUEST_JOIN_TO} { status: '${consts.status.PENDING}' }]->(group)
      RETURN properties(group) AS groupProps, joinRequest.status AS status`,
            {userId, groupId},
        );

        const recordObjects = records.map(record => record.toObject());

        if (recordObjects.length === 0) {
            // throw error
        }

        return recordObjects[0];
    }

    async _getGroupType(txc, groupId) {
        const {records} = await txc.run(
            `MATCH (group:${props.GROUP} { id: $groupId })
      RETURN group.groupType AS groupType`,
            {groupId},
        );

        const recordObjects = records.map(record => record.toObject());

        if (recordObjects.length === 0) {
            // throw error
        }

        return recordObjects[0];
    }


    async perform(session, timeout, {
        groupId,
        userId
    }) {
        let err = null;
        let value = null;

        const txConfig = {
            timeout,
            metadata: {
                name: 'join-group',
                userId,
                groupId,
            },
        };

        await session.writeTransaction(async (txc) => {
            const {
                groupType,
            } = await this._getGroupType(txc, groupId);


            switch (groupType) {
                case consts.groupType.PUBLIC: {
                    const {groupProps} = await common.joinGroup(txc, userId, groupId);

                    // build final result
                    value = {
                        groupProps,
                        userId,
                        status: consts.status.MEMBER,
                    };
                    break;
                }
                case consts.groupType.CLOSED: case consts.groupType.PRIVATE:{
                    // TODO: add max number of join requests for group / user
                    value = {
                        ...await this._joinClosedGroup(txc, userId, groupId),
                        userId,
                    };
                    break;
                }
                default:
                    break;
            }
        }, txConfig);

        return {value, err};
    }
}

module.exports = new JoinGroup();
