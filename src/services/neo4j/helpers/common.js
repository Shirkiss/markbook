const { props, relations } = require('../helpers/consts');

class Common {
    static async runQuery(txc, query, params) {
        const results = await txc.run(query, params);
        const records = results.records.map(record => record.toObject());
        return records.length > 0 ? records[0] : {};
    }

    static async joinGroup(txc, userId, groupId) {
        const { records } = await txc.run(
            `MATCH (user:${props.USER} { id: $userId })
      MATCH (group:${props.GROUP} { id: $groupId })
            MERGE (user)-[rel:${relations.MEMBER_OF}]->(group)
      ON CREATE SET group.membersCount = group.membersCount + 1, rel.memberSince = datetime()
      
         RETURN properties(group) AS groupProps`,
            { userId, groupId },
        );

        const recordObjects = records.map(record => record.toObject());

        return recordObjects.length > 0
            ? recordObjects[0]
            : { success: false };
    }


    static async getGroup(txc, groupId) {
        const results = await txc.run(
            `MATCH (group:${props.GROUP} { id: $groupId })
      RETURN group`,
            { groupId },
        );

        const records = results.records.map(record => record.toObject());

        if (records.length === 0) {
            // throw error
        }

        const { group } = records[0];

        return { group };
    }

    static async getGroupLeaderId(txc, groupId) {
        const results = await txc.run(
            `MATCH (group:${props.GROUP} { id: $groupId }) -[:${relations.LEAD_BY}]-> (leader:${props.USER})
      RETURN leader.id AS leaderId`,
            { groupId },
        );

        const records = results.records.map(record => record.toObject());

        return records.length > 0
            ? records[0].leaderId
            : null;
    }

    static async checkUserIsOwner(txc, userId, groupId) {
        const results = await txc.run(
            `MATCH (:${props.USER} { id: $userId }) <-[:${relations.LEAD_BY}]- (group:${props.GROUP} { id: $groupId })
      RETURN group.id AS groupId`,
            { userId, groupId },
        );

        return results.records.length === 1;
    }

    static async checkUserIsMember(txc, userId, groupId) {
        const results = await txc.run(
            `MATCH (:${props.USER} { id: $userId }) -[:${relations.MEMBER_OF}]-> (group:${props.GROUP} { id: $groupId })
      RETURN group.id AS groupId`,
            { userId, groupId },
        );

        return results.records.length === 1;
    }

    static async checkPendingRequestExists(txc, userId, groupId) {
        const results = await txc.run(
            `MATCH (:${props.USER} { id: $userId }) -[:${relations.REQUEST_JOIN_TO}]-> (group:${props.GROUP} { id: $groupId })
      RETURN group.id AS groupId`,
            { userId, groupId },
        );

        return results.records.length === 1;
    }

    static async removeUserJoinRequests(txc, userId) {
        await txc.run(
            `MATCH (:${props.USER} { id: $userId })-[triedJoinRequest:${relations.REQUEST_JOIN_TO}]->(:${props.GROUP})
      DELETE triedJoinRequest`,
            { userId },
        );
    }
}

module.exports = Common;
