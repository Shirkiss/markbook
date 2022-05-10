const uuid = require('uuid');
const {props, relations} = require('../helpers/consts');
const {CypherQuery} = require('../base/cypher-query');

class CreateGroup extends CypherQuery {
    get required() {
        return ['ownerId', 'groupType', 'groupName', 'groupDescription'];
    }

    static get metadataProps() {
        return ['ownerId', 'groupType', 'groupName', 'groupDescription', 'groupBadge'];
    }

    get optional() {
        return ['country', 'membersCount', 'id', 'groupId', 'groupBadge'];
    }

    async _createGroup(txc, params) {
        const groupId = params.groupId || uuid.v4();
        const {ownerId} = params;
        const finalParams = {
            ...params,
            membersCount: 1,
            userId: ownerId,
        };

        let newGroupQuery = `MATCH (user:${props.USER} { id: $ownerId }) 
    CREATE (group:${props.GROUP} { id: $id })
    -[:${relations.LEAD_BY} { leaderSince: datetime() }]->(user)
    -[:${relations.MEMBER_OF} { memberSince: datetime() }]->(group)
    SET group += `;
        newGroupQuery = this.fillProps(newGroupQuery, finalParams);
        newGroupQuery += ' SET group.createdAt = timestamp()';
        newGroupQuery += ' RETURN properties(group) AS groupProps';

        const {records} = await txc.run(newGroupQuery, {...finalParams, id: groupId});

        const recordObjects = records.map(record => record.toObject());

        return recordObjects[0];
    }

    async perform(session, timeout, ...args) {
        const [params] = args;
        const {ownerId} = params;

        const txConfig = {
            timeout,
            metadata: {
                name: 'create-group',
                ownerId,
            },
        };

        const group = await session.writeTransaction(async (txc) => {
            // check membership
            const {userId} = await this._getUser(txc, ownerId);

            if (!userId) {
                return {err: 'USER_NOT_FOUND'};
            }

            const {groupProps} = await this._createGroup(txc, params);
            return groupProps;
        }, txConfig);

        if (group.err) {
            return {err: group.err};
        }

        return {value: group};
    }

    async _getUser(txc, ownerId) {
        const {records} = await txc.run(
            `MATCH (user:${props.USER} { id: $ownerId })
             RETURN user.id AS userId`,
            {ownerId});

        const recordObjects = records.map(record => record.toObject());

        return recordObjects.length === 0
            ? {}
            : recordObjects[0];
    }

}

module.exports = new CreateGroup();
