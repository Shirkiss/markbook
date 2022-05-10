const { props, relations, consts } = require('../helpers/consts');
const { CypherQuery } = require('../base/cypher-query');
const common = require('../helpers/common');

class UpdateGroup extends CypherQuery {
  get required() {
    return ['ownerId', 'groupId'];
  }

  static get metadataProps() {
    return ['ownerId', 'groupId'];
  }

  get optional() {
    return ['country', 'groupType', 'groupName', 'groupDescription', 'groupBadge'];
  }

  get editableFields() {
    return ['groupBadge', 'groupDescription', 'groupType'];
  }

  async _updateGroup(txc, ownerId, groupId, editParams) {
    const results = await txc.run(
      `MATCH (group:${props.GROUP} { id: $groupId }) -[:${relations.LEAD_BY}]-> (user:${props.USER} { id: $ownerId })
      
      SET group._LOCK_ = true
      
      WITH group, group.groupType AS origGroupType

      SET group += $editParams

      WITH 
        group,
        origGroupType,
        coalesce($editParams.groupType, '') AS newGroupType
      
      CALL apoc.do.when(
        origGroupType = '${consts.groupType.PRIVATE}' AND newGroupType = '${consts.groupType.PUBLIC}',
        'OPTIONAL MATCH (group)-[joinRequests:${relations.REQUEST_JOIN_TO}]-(:${props.USER})
        DELETE joinRequests
        RETURN count(joinRequests) AS joinRequestCount',
        'RETURN 0 AS joinRequestCount',
        { group: group, origGroupType: origGroupType, newGroupType: newGroupType }
      ) YIELD value AS joinRequestDeleted
      
      REMOVE group._LOCK_
      
      RETURN properties(group) AS group`,
      { groupId, ownerId, editParams },
    );

    const records = results.records.map(record => record.toObject());

    return records.length > 0 
      ? records[0]
      : null;
  }

  async perform(session, timeout, ...args) {
    const [params] = args;
    const { ownerId, groupId } = params;

    const txConfig = {
      timeout,
      metadata: { 
        name: 'update-group',
        ownerId,
        groupId,
      },
    };

    let err = null;
    let group = null;

    await session.writeTransaction(async (txc) => {
      const isOwner = await common.checkUserIsOwner(txc, ownerId, groupId);
      if (!isOwner) {
        err = 'NOT_OWNER';
      } else {
        // filter only provided params
        const editParams = {};
        this.editableFields.forEach((field) => {
          if (params[field] !== undefined) {
            editParams[field] = params[field];
          }
        });
        
        // eslint-disable-next-line no-underscore-dangle
        ({ group } = await this._updateGroup(txc, ownerId, groupId, editParams));
      }
    }, txConfig);

    return { value: group, err };
  }
}

module.exports = new UpdateGroup();
