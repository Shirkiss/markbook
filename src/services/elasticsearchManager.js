const {Client} = require('@elastic/elasticsearch');

const client = new Client({
    node: 'https://localhost:9200', // SHIR -9201
    auth: {
        username: 'elastic',
         password: 'MGnarGnZDlXAo*BYfCK7' // MAI's
        //password: '7ZBKnYBd104VDK3t1rO-' //SHIR's
    },
    tls: {rejectUnauthorized: false}
    // auth: {
    //     apiKey: 'YVVUcGU0QUJ5dkhCczh3aUVRdFY6UkZGQzVycEdRZmE5cG5Fd0pGWFdmQQ==',
    // },

    // cloud: {
    //     id: 'markbook:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJDNhY2VkZjkyYjkyOTQ0Yzg4NGMzZDI3NDUzZWMwNGJiJGM1MTM0NjU2ZDk4ODQyYjY4MmU0OGZjMjRmNjIzYzc0'
    // },
    // auth: {
    //     apiKey: 'M3FvUTRIOEJCZ1RXNFR5UUlmOXE6Vlk4R25EME5UWHVVSWwxXzBCOEpFUQ==',
    // },
});

async function getAll(userId, index, from = 0, size = 20) {
    const result = await client.search({
            index: index,
            from,
            size,
            body: {
                query: {
                    "bool": {
                        "must": {
                            "term": {userId}
                        },
                        "must_not": {
                            "exists": {
                                "field": "groupId"
                            }
                        }
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

async function increaseClicksCounter(id, index) {
    await client.update({
        index,
        id,
        script: {
            source: "ctx._source.clicksCounter += 1",
        }
    })
    await client.indices.refresh({index})
}

async function addDocument(data, index) {
    data['timestamp'] = new Date();
    await client.index({
        index,
        document: data,
    })
    await client.indices.refresh({index})
}

async function addDocumentWithId(id, data, index) {
    data['timestamp'] = new Date();
    await client.index({
        index,
        id,
        document: data,
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

async function getUserDocumentsByHighestClicksCounter(userId, index) {
    const result = await client.search({
        index,
        body: {
            sort: {"clicksCounter": "desc"},
            query: {
                "term": {userId}
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

async function getGroupLinks(groupId, index, from = 0, size = 20) {
    const result = await client.search({
            index: index,
            from,
            size,
            body: {
                query: {
                    "bool": {
                        "must": {
                            "term": {groupId}
                        },
                    },
                }
            }
        }
    );
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

async function getByIds(ids, index) {
    const result = await client.mget({
            index,
            ids
        }
    )
    return result.docs;
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
    mostFrequentKeywordForUser,
    addDocumentWithId,
    increaseClicksCounter,
    getUserDocumentsByHighestClicksCounter,
    getByIds,
    getGroupLinks
};