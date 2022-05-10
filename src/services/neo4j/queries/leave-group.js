const { props, relations, consts } = require('../helpers/consts');
const { CypherQuery } = require('../base/cypher-query');

class LeaveGroup extends CypherQuery {
    get required() {
        return ['groupId', 'userId'];
    }

    static get metadataProps() {
        return ['groupId', 'userId'];
    }

    async _removeUserFromGroup(txc, userId, groupId) {
        const { records } = await txc.run(
            `MATCH (group:${props.GROUP} { id: $groupId })

      SET group._LOCK_ = true

      WITH group

      MATCH (user:${props.USER} { id: $userId }) -[rels:${relations.MEMBER_OF}|${relations.LEAD_BY}]- (group)
      DELETE rels

      REMOVE group._LOCK_

      WITH
        group,
        size([rel IN collect(rels) WHERE type(rel) = '${relations.LEAD_BY}']) = 1 AS wasLeader

      SET 
        group.membersCount = group.membersCount - 1
      
      WITH 
        group,
        group.membersCount AS membersCount,
        wasLeader

      CALL apoc.do.when(
        membersCount = 0,
        'DETACH DELETE group RETURN "deleted"'
      , '',
      { group: group, membersCount: membersCount }
      ) YIELD value
      
      RETURN membersCount, wasLeader`, { userId, groupId },
        );

        const recordObjects = records.map(record => record.toObject());

        let ret;

        if (recordObjects.length === 0) {
            ret = {
                wasMember: false,
            };
        } else {
            ret = {
                wasMember: true,
                wasLeader: recordObjects[0].wasLeader,
                membersCount: recordObjects[0].membersCount,
            };
        }

        return ret;
    }

    async _promoteNewLeader(txc, userId, groupId) {
        const { records } = await txc.run(
            `MATCH (newOwner:${props.USER})-[memberRel:${relations.MEMBER_OF}]->(group:${props.GROUP} { id: $groupId })
      WHERE newOwner.id <> $userId
      WITH memberRel, newOwner, group
      ORDER BY memberRel.memberSince ASC
      LIMIT 1
      MERGE (group)-[:${relations.LEAD_BY} { leaderSince: datetime() }]->(newOwner)
      RETURN newOwner.id AS newGroupOwnerId`, { userId, groupId },
        );


        const recordObjects = records.map(record => record.toObject());
        return recordObjects.length > 0
            ? recordObjects[0].newGroupOwnerId
            : 0;
    }

    async perform(session, timeout, { groupId, userId }) {
        let value = null;

        const txConfig = {
            timeout,
            metadata: {
                name: 'leave-group',
                userId,
                groupId,
            },
        };

        await session.writeTransaction(async (txc) => {
            value = await this.userLeavesGroup(txc, userId, groupId);
        }, txConfig);

        return { value };
    }

    async userLeavesGroup(txc, userId, groupId) {
        // remove membership & leadership
        const { wasMember, wasLeader, membersCount } = await this._removeUserFromGroup(txc, userId, groupId);

        if (wasMember === false) {
            return {};
        }

        let newGroupOwnerId = null;
        let userGroupRole = consts.role.MEMBER;
        let groupDissolved = false;

        if (wasLeader) {
            userGroupRole = consts.role.LEADER;
            if (membersCount === 0) {
                // this means group now have no members and was deleted
                groupDissolved = true;
            } else if (membersCount > 0) {
                newGroupOwnerId = await this._promoteNewLeader(txc, userId, groupId);
            }
        }

        return {
            groupId,
            userGroupRole,
            newGroupOwnerId,
            groupDissolved,
        };
    }
}

module.exports = new LeaveGroup();
