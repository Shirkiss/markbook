const {props, relations} = require('../helpers/consts');
const {CypherQuery} = require('../base/cypher-query');
const common = require('../helpers/common');

class KickMember extends CypherQuery {
    get required() {
        return ['groupId', 'ownerId', 'userId'];
    }

    static get metadataProps() {
        return ['groupId', 'userId'];
    }

    async perform(session, timeout, {groupId, ownerId, userId}) {

        const txConfig = {
            timeout,
            metadata: {
                name: 'kick-member',
                userId,
                groupId,
                ownerId,
            },
        };

        let value = null;
        let err = null;

        await session.writeTransaction(async (txc) => {
            const kickingUserIsOwner = await common.checkUserIsOwner(txc, ownerId, groupId);
            if (!kickingUserIsOwner) {
                err = 'NOT_OWNER';
            } else {
                const {id, wasMember} = await this._kickMember(txc, userId, groupId);
                if (!wasMember) {
                    value = await this.getGroupDetails(txc, groupId);
                    err = 'NOT_IN_GROUP';
                    return;
                }

                value = {id};
            }
        }, txConfig);

        return {value, err};
    }

    async _kickMember(txc, userId, groupId) {
        const {records} = await txc.run(
            `MATCH (group:${props.GROUP} { id: $groupId })<-[membership:${relations.MEMBER_OF}]-(user:${props.USER} { id: $userId })
      MERGE (user)-[kick:${relations.KICKED_FROM}]->(group)
      ON CREATE SET group.membersCount = group.membersCount - 1
      DELETE membership
      RETURN group.id AS id`,
            {userId, groupId},
        );

        const recordObjects = records.map(record => record.toObject());

        if (recordObjects.length === 0) {
            return {wasMember: false};
        }

        const {id} = recordObjects[0];

        return {wasMember: true, id};
    }

    async getGroupDetails(txc, groupId) {
        const {records} = await txc.run(
            `MATCH (group:${props.GROUP} { id: $groupId })
      RETURN group.id AS id`,
            {groupId},
        );

        const recordObjects = records.map(record => record.toObject());

        return recordObjects[0];
    }
}

module.exports = new KickMember();
