const props = {
    GROUP: 'Group',
    USER: 'User',
};

const relations = {
    FRIEND_OF: 'FRIEND_OF',
    LEAD_BY: 'LEAD_BY',
    MEMBER_OF: 'MEMBER_OF',
    REQUEST_JOIN_TO: 'REQUEST_JOIN_TO',
    KICKED_FROM: 'KICKED_FROM',
    REJECTED_FROM: 'REJECTED_FROM',
};

const mediators = {
    FRIEND_OF: ':friend:',
    LEAD_BY: ':lead',
    MEMBER_OF: ':member:',
    REQUEST_JOIN_TO: ':request:',
    KICKED_FROM: ':kicked:',
    REJECTED_FROM: ':rejected:',
};

const consts = {
    GROUP_SEARCH_MAX_RESULTS: 20,
    GROUP_SEARCH_MIN_KEYWORD_LENGTH: 2,
    GROUP_SEARCH_RESULT_PROPERTIES: ['groupName', 'groupBadge', 'membersCount', 'maxMembersCount', 'country'],
    GROUP_JOIN_PROPERTIES: ['groupName', 'groupBadge', 'membersCount', 'maxMembersCount', 'country'],
    DEFAULT_JOIN_REQUEST_EXPIRATION_TIME: 86400, // 60 * 60 * 24 - 1 day
    DEFAULT_TIMEOUT: 1000,

    status: {
        MEMBER: 'member',
        NON_MEMBER: 'nonmember',
        PENDING: 'pending',
        REJECTED: 'rejected',
        KICKED: 'kicked',
    },

    role: {
        LEADER: 'leader',
        MEMBER: 'member',
    },

    groupType: {
        PUBLIC: 'Public',
        CLOSED: 'Closed',
        PRIVATE: 'Private'
    },
};

module.exports = {
    props,
    relations,
    mediators,
    consts,
};
