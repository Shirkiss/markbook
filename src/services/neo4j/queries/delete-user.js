const {props, relations} = require('../helpers/consts');
const {CypherQuery} = require('../base/cypher-query');
const leaveGroup = require('./leave-group');

class DeleteUser extends CypherQuery {
    get required() {
        return ['userId'];
    }

    static get metadataProps() {
        return ['ownerId'];
    }

    async perform(session, timeout, {userId}) {
        let value = false;

        const txConfig = {
            timeout,
            metadata: {
                name: 'delete-user',
                userId,
            },
        };

        await session.writeTransaction(async (txc) => {
            const getGroupQuery = `MATCH (:${props.USER} { id: $userId })-[:${relations.MEMBER_OF}]->(groups:${props.GROUP})
        RETURN groups`;


            // TODO: leave each group the user is on
            const {records} = await txc.run(getGroupQuery, {userId});
            const recordObjects = records.map(record => record.toObject());

            for (let index = 0; index < recordObjects.length; index++) {
                await leaveGroup.userLeavesGroup(txc, userId, recordObjects[index].groups.properties.id)
            }

            const userDeleteQuery = `MATCH (user:${props.USER} { id: $userId })
        DETACH DELETE user
        RETURN count(user) as deletedCount`;

            const {deletedCount} = await txc.run(userDeleteQuery, {userId});


            value = deletedCount > 0;
        }, txConfig);

        return {value};
    }
}

module.exports = new DeleteUser();
