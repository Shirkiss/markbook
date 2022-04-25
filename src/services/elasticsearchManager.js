const {Client} = require('@elastic/elasticsearch');

const client = new Client({
    cloud: {
        id: 'markbook:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJDNhY2VkZjkyYjkyOTQ0Yzg4NGMzZDI3NDUzZWMwNGJiJGM1MTM0NjU2ZDk4ODQyYjY4MmU0OGZjMjRmNjIzYzc0'
    },
    auth: {
        apiKey: 'M3FvUTRIOEJCZ1RXNFR5UUlmOXE6Vlk4R25EME5UWHVVSWwxXzBCOEpFUQ==',
    },
});

async function getAll(userId, index) {
    const result = await client.search({
            index: index,
            body: {
                query: {
                    "bool": {
                        "must": {
                            "term": {userId}
                        },
                    },
                }
            }
        }
    );
    return result.hits.hits;
}

async function createIndex(index) {
    const exists = await client.indices.exists({
        index
    });
    if (!exists) {
        await client.indices.create({
            index,
            body: {
                "mappings": {
                    "properties": {
                        "timestamp": {
                            "type": "date",
                        },
                        "userId": {
                            "type": "text",
                        }
                    }
                }
            }
        })
    }
}

async function deleteIndex(index) {
    await client.indices.delete({index});
}

async function deleteById(id, index) {
    await client.delete({index, id});
}

async function deleteByUserId(userId, index) {
    await client.deleteByQuery({
        index,
        body: {
            query: {
                match: {
                    userId
                }
            }
        }
    });
}

async function editDocument(id, data, index) {
    data['lastEditTime'] = new Date();
    await client.index({
        index,
        id,
        document: data
    })
    await client.indices.refresh({index})
}

async function addDocument(data, index) {
    data['timestamp'] = new Date();
    await client.index({
        index,
        document: data
    })
    await client.indices.refresh({index})
}

async function prefixSearch(prefix, index, field, userId) {
    const result = await client.search({
        index,
        body: {
            query: {
                "bool": {
                    "must": [{
                        "term": {userId}
                    }, {
                        "match_phrase_prefix": {
                            [field]: {
                                "query": prefix,
                                "max_expansions": 10
                            }
                        }
                    }],
                },
            }
        }
    })
    return result.hits.hits;
}

async function prefixSearchMulti(prefix, fields, userId, index) {
    const result = await client.search({
            index,
            body: {
                query: {
                    "bool": {
                        "must": [{
                            "term": {userId}
                        }, {
                            multi_match: {
                                query: prefix,
                                type: 'phrase_prefix',
                                fields
                            },
                        }],
                    },
                }
            }
        }
    )
    return result.hits.hits;
}

async function getById(id, index) {
    const result = await client.get({
            index,
            id
        }
    )
    return result.hits.hits;
}

async function prefixSearchAllFields(prefix, userId, index) {
    const result = await client.search({
            index,
            body: {
                query: {
                    "bool": {
                        "must": [{
                            "term": {userId}
                        }, {
                            multi_match: {
                                query: prefix,
                                type: 'phrase_prefix',
                            },
                        }],
                    },
                }
            }
        }
    );
    return result.hits.hits;

}


async function mostFrequentKeyword(limit, index) {
    const result = await client.search({
        index,
        body: {
            aggs: {
                top_keywords: {
                    terms: {
                        field: 'keywords.keyword',
                        size: limit
                    },
                }
            }
        }
    });
    return result.aggregations.top_keywords.buckets;
}

async function mostFrequentKeywordByPrefix(prefix, limit, index) {
    const result = await client.search({
        index,
        body: {
            aggs: {
                top_keywords: {
                    terms: {
                        field: 'keywords.keyword',
                        include: `${prefix}.*`,
                        size: limit
                    },
                }
            },
        }
    });
    return result.aggregations.top_keywords.buckets;
}

async function mostFrequentKeywordForUser(userId, limit, index) {
    const result = await client.search({
        index,
        body: {
            "query": {"term": {userId}},
            aggs: {
                top_keywords: {
                    terms: {
                        field: 'keywords.keyword',
                        size: limit
                    },
                }
            }
        }
    });
    return result.aggregations.top_keywords.buckets;
}

async function mostFrequentKeywordForUserByPrefix(userId, prefix, limit, index) {
    const result = await client.search({
        index,
        body: {
            query: {"term": {userId}},
            aggs: {
                top_keywords: {
                    terms: {
                        field: 'keywords.keyword',
                        include: `${prefix}.*`,
                        size: limit
                    },
                }
            }
        }
    });
    return result.aggregations.top_keywords.buckets;
}

module.exports = {
    getAll,
    editDocument,
    addDocument,
    createIndex,
    deleteById,
    prefixSearchAllFields,
    deleteByUserId,
    getById,
    deleteIndex,
    prefixSearchMulti,
    mostFrequentKeywordForUserByPrefix,
    mostFrequentKeywordByPrefix,
    mostFrequentKeyword,
    mostFrequentKeywordForUser
};