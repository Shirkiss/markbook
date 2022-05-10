const {CypherQuery} = require('../base/cypher-query');
const { props, relations } = require('../helpers/consts');

class AddUserFriend extends CypherQuery {
    get required() {
        return ['userId', 'friendId'];
    }

    static get metadataProps() {
        return ['userId'];
    }

    async perform(session, timeout, {userId, friendId}) {

        const txConfig = {
            timeout,
            metadata: {
                name: 'add-user-friends',
            },
        };

        await session.writeTransaction(async (txc) => {
            await txc.run(`
      MATCH (user:${props.USER} {id: $userId})
                            MATCH (friend:${props.USER} {id: $friendId})
                            MERGE (user)-[rel:${relations.FRIEND_OF}]->(friend)
                            SET rel.friendSince = timestamp()
                            RETURN user, friend`, {userId, friendId});
        }, txConfig);


        return {records: ['Success']};
    }
}

module.exports = new AddUserFriend();
