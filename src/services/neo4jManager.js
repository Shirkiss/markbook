const neo4j = require('neo4j-driver');
const HEALTH_CHECK_STRING = 'Healthy';

class Neo4jManager {

    constructor() {
        this.database_name = process.env.NEO4J_DATABASE_NAME || 'neo4j';
    }

    async init() {
        const endpoint = process.env.NEO4J_ENDPOINT || 'neo4j+s://faa74a68.databases.neo4j.io';
        const username = process.env.NEO4J_USERNAME || 'neo4j';
        const password = process.env.NEO4J_PASSWORD || '3WIkmmYhm7T8EYJFJJU-0bwWo--z9ZqZzVlz8zmh7b8';
        this.driver = neo4j.driver(endpoint, neo4j.auth.basic(username, password));
        if (!await this.deepHealth()) {
            throw new Error('Failed to initialize neo4j session instance!');
        }
    }

    async deepHealth() {
        const session = await this.newSession();
        try {
            const writeQuery = `WITH $healthString as healthcheck RETURN healthcheck`
            const result = await session.writeTransaction(tx =>
                tx.run(writeQuery, {healthString: HEALTH_CHECK_STRING})
            )
            return result.records && result.records.length === 1 && result.records[0].get('healthcheck') === HEALTH_CHECK_STRING;
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async destroy() {
        await this.driver.close();
    }

    async newSession() {
        const {driver} = this;

        const sessionOptions = {
            database: this.database_name,
        };

        return driver.session(sessionOptions);
    }

    async createUserExample() {
        const session = await this.newSession();
        try {
            const person1Name = 'Someone'
            const person2Name = 'David'

            const writeQuery = `MERGE (p1:Person { name: $person1Name })
                       MERGE (p2:Person { name: $person2Name })
                       MERGE (p1)-[:KNOWS]->(p2)
                       RETURN p1, p2`

            const writeResult = await session.writeTransaction(tx =>
                tx.run(writeQuery, {person1Name, person2Name})
            )
            writeResult.records.forEach(record => {
                const person1Node = record.get('p1')
                const person2Node = record.get('p2')
                console.log(
                    `Created friendship between: ${person1Node.properties.name}, ${person2Node.properties.name}`
                )
            })
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async createUser(userId) {
        const session = await this.newSession();
        try {
            const writeQuery = `MERGE (user:User {id: $userId})
                            RETURN user`

            const writeResult = await session.writeTransaction(tx =>
                tx.run(writeQuery, {userId})
            )
            writeResult.records.forEach(record => {
                const user = record.get('user')
                console.log(
                    `Created a user: ${user.properties.id}`
                )
            })
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async deleteUser(userId) {
        const session = await this.newSession();
        try {
            const writeQuery = `MATCH (user:User {id: $userId})
                            DELETE user`

            const writeResult = await session.writeTransaction(tx =>
                tx.run(writeQuery, {userId})
            )
            writeResult.records.forEach(record => {
                const user = record.get('user')
                console.log(
                    `Deleted the user: ${user.properties.id}`
                )
            })
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async deleteUserHard(userId) {
        const session = await this.newSession();
        try {
            const writeQuery = `MATCH (user:User {id: $userId})
                            DETACH DELETE user`

            const writeResult = await session.writeTransaction(tx =>
                tx.run(writeQuery, {userId})
            )
            writeResult.records.forEach(record => {
                const user = record.get('user')
                console.log(
                    `Deleted the user: ${user.properties.id}`
                )
            })
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async deleteGroupHard(groupName) {
        const session = await this.newSession();
        try {
            const writeQuery = `MATCH (group:Group {name: $groupName})
                            DETACH DELETE group`

            const writeResult = await session.writeTransaction(tx =>
                tx.run(writeQuery, {groupName})
            )
            writeResult.records.forEach(record => {
                console.log(
                    `Deleted the group: ${groupName}`
                )
            })
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async deleteAllUserFriends(userId) {
        const session = await this.newSession();
        try {
            const writeQuery = `MATCH (user:User {id: $userId})-[rel:IS_FRIENDS_WITH]->()
                                DELETE rel`

            const writeResult = await session.writeTransaction(tx =>
                tx.run(writeQuery, {userId})
            )
            writeResult.records.forEach(record => {
                const user = record.get('user')
                console.log(
                    `Deleted all friends for user: ${user.properties.id}`
                )
            })
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async deleteGroup(groupName) {
        const session = await this.newSession();
        try {
            const writeQuery = `MATCH (group:Group {name: $groupName})
                            DELETE group`

            const writeResult = await session.writeTransaction(tx =>
                tx.run(writeQuery, {groupName})
            )
            writeResult.records.forEach(record => {
                const group = record.get('group')
                console.log(
                    `Deleted the group: ${group.properties.name}`
                )
            })
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async deleteFriend(userId, friendId) {
        const session = await this.newSession();
        try {
            const writeQuery = `MATCH (user {id: $userId})-[rel:IS_FRIENDS_WITH]->(userFriend:User {id: $friendId})
                                DELETE user, userFriend, rel`

            const writeResult = await session.writeTransaction(tx =>
                tx.run(writeQuery, {userId, friendId})
            )
            writeResult.records.forEach(record => {
                const user = record.get('user')
                const friend = record.get('friend')
                console.log(
                    `Deleted the rel between: ${user.properties.id} and ${friend.properties.id}`
                )
            })
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async createGroup(groupName) {
        const session = await this.newSession();
        try {
            const writeQuery = `MERGE (group:Group {name: $groupName, createdDate: date()})
                            RETURN group`

            const writeResult = await session.writeTransaction(tx =>
                tx.run(writeQuery, {groupName})
            )
            writeResult.records.forEach(record => {
                const group = record.get('group')
                console.log(
                    `Created a group: ${group.properties.name}`
                )
            })
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async setGroupCreator(userId, groupName) {
        const session = await this.newSession();
        try {
            const writeQuery = `MATCH (user:User {id: $userId})
                            MATCH (group:Group {name: $groupName})
                            MERGE (group)-[rel:CREATED_BY]->(user)
                            RETURN user, group`

            const writeResult = await session.writeTransaction(tx =>
                tx.run(writeQuery, {groupName, userId})
            )
            writeResult.records.forEach(record => {
                const group = record.get('group')
                const user = record.get('user')
                console.log(
                    `${group.properties.name} was created by ${user.properties.id}`
                )
            })
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async setGroupOwner(userId, groupName) {
        const session = await this.newSession();
        try {
            const writeQuery = `MATCH (user:User {id: $userId})
                            MATCH (group:Group {name: $groupName})
                            MERGE (user)-[rel:IS_OWNER_OF]->(group)
                            RETURN user, group`

            const writeResult = await session.writeTransaction(tx =>
                tx.run(writeQuery, {groupName, userId})
            )
            writeResult.records.forEach(record => {
                const group = record.get('group')
                const user = record.get('user')
                console.log(
                    `${user.properties.id} is owner of: ${group.properties.name}`
                )
            })
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async addFriend(userId, friendUserId) {
        const session = await this.newSession();
        try {
            const writeQuery = `MATCH (user:User {id: $userId})
                            MATCH (friend:User {id: $friendUserId})
                            MERGE (user)-[rel:IS_FRIENDS_WITH]->(friend)
                            SET rel.startDate = date()
                            RETURN user, friend`

            const writeResult = await session.writeTransaction(tx =>
                tx.run(writeQuery, {userId, friendUserId})
            )
            writeResult.records.forEach(record => {
                const user = record.get('user')
                const friend = record.get('friend')
                console.log(
                    `Created friendship between: ${user.properties.id}, ${friend.properties.id}`
                )
            })
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async joinGroup(userId, groupName) {
        const session = await this.newSession();
        try {
            const writeQuery = `MATCH (user:User {id: $userId})
                            MATCH (group:Group {name: $groupName})
                            MERGE (user)-[rel:IS_MEMBER_IN]->(group)
                            SET rel.joinDate = date()
                            RETURN user, group`

            const writeResult = await session.writeTransaction(tx =>
                tx.run(writeQuery, {userId, groupName})
            )
            writeResult.records.forEach(record => {
                const user = record.get('user')
                const friend = record.get('group')
                console.log(
                    `${user.properties.id} has joined the group ${friend.properties.name}`
                )
            })
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async getFriends(userId) {
        const session = await this.newSession();
        try {
            const writeQuery = `MATCH (:User {id: $userId})-[:IS_FRIENDS_WITH]-(userFriends)
                                RETURN userFriends`

            const writeResult = await session.writeTransaction(tx =>
                tx.run(writeQuery, {userId})
            )

            writeResult.records.forEach(record => {
                const userFriend = record.get('userFriends')
                console.log(
                    `${userId} is friend with ${userFriend.properties.id}`
                )
            })
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async getUserGroups(userId) {
        const session = await this.newSession();
        try {
            const writeQuery = `MATCH (:User {id: $userId})-[:IS_MEMBER_IN]-(userGroups)
                                RETURN userGroups`

            const writeResult = await session.writeTransaction(tx =>
                tx.run(writeQuery, {userId})
            )

            writeResult.records.forEach(record => {
                const userGroup = record.get('userGroups')
                console.log(
                    `${userId} is member in ${userGroup.properties.name}`
                )
            })
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

    async getFriendsOnGroup(userId, groupName) {
        const session = await this.newSession();
        try {
            const writeQuery = `MATCH (:User {id: $userId})-[:IS_FRIENDS_WITH]-(userFriends)
                                MATCH (userFriends)-[:IS_MEMBER_IN]->(group:Group {name:$groupName})
                                RETURN userFriends`

            const writeResult = await session.writeTransaction(tx =>
                tx.run(writeQuery, {userId, groupName})
            )

            writeResult.records.forEach(record => {
                const userFriend = record.get('userFriends')
                console.log(
                    `${userId} is friend with ${userFriend.properties.id}`
                )
            })
        } catch (error) {
            console.error('Something went wrong: ', error)
        } finally {
            await session.close()
        }
    }

}

module.exports = Neo4jManager;