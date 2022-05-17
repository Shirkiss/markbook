const {props, relations} = require('../helpers/consts');
const {CypherQuery} = require('../base/cypher-query');
const common = require('../helpers/common');

class AddLinkToGroup extends CypherQuery {
    get required() {
        return ['userId', 'groupId', 'linkId'];
    }

    static get metadataProps() {
        return ['userId', 'groupId', 'linkId'];
    }

    get optional() {
        return [];
    }

    async _getGroupLinks(txc, groupId) {
        const {records} = await txc.run(
            `MATCH (group:${props.GROUP} { id: $groupId })
              SET group._LOCK_ = true

              WITH 
              group,
        group.links as groupLinks
      
      CALL apoc.do.when(
        groupLinks IS NULL,
        'RETURN []',
        'RETURN groupLinks',
        { groupLinks: groupLinks }
      ) YIELD value AS groupLinksList
      
            REMOVE group._LOCK_
      RETURN groupLinksList`,




            {groupId},
        );

        const recordObjects = records.map(record => record.toObject());

        if (recordObjects.length === 0) {
            // throw error
        }

        return recordObjects[0]['groupLinksList']['groupLinks'] || [];
    }


    async _updateGroup(txc, userId, groupId, groupLinks) {
        const results = await txc.run(
            `MATCH (group:${props.GROUP} { id: $groupId }) <-[:${relations.MEMBER_OF}]- (user:${props.USER} { id: $userId })
      
      SET group._LOCK_ = true
      
      SET group.links = $groupLinks
      
      REMOVE group._LOCK_
      
      RETURN properties(group) AS group`,
            {groupId, userId, groupLinks},
        );

        const records = results.records.map(record => record.toObject());

        return records.length > 0
            ? records[0]
            : null;
    }

    async perform(session, timeout, {userId, groupId, linkId}) {
        const txConfig = {
            timeout,
            metadata: {
                name: 'add-link-to-group',
                userId,
                groupId,
            },
        };

        let err = null;
        let group = null;

        await session.writeTransaction(async (txc) => {
            const isMember = await common.checkUserIsMember(txc, userId, groupId);
            if (!isMember) {
                err = 'NOT_MEMBER';
            } else {
                const groupLinksList = await this._getGroupLinks(txc, groupId);
                groupLinksList.push(linkId);
                ({group} = await this._updateGroup(txc, userId, groupId, groupLinksList));
            }
        }, txConfig);

        return {value: group, err};
    }
}

module.exports = new AddLinkToGroup();
