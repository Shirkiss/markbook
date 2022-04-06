const {Client} = require('@elastic/elasticsearch');

class ElasticSearch {
    constructor(index) {
        this.client = new Client({
            cloud: {
                id: 'markbook:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJDNhY2VkZjkyYjkyOTQ0Yzg4NGMzZDI3NDUzZWMwNGJiJGM1MTM0NjU2ZDk4ODQyYjY4MmU0OGZjMjRmNjIzYzc0'
            },
            auth: {
                apiKey: 'M3FvUTRIOEJCZ1RXNFR5UUlmOXE6Vlk4R25EME5UWHVVSWwxXzBCOEpFUQ==',
            },
        });
        this.index = index;
    }

    async init() {
        await this.createIndex(this.index);
    }

    async createIndex(index) {
        const exists = await this.client.indices.exists({
            index
        });
        if (!exists) {
            await this.client.indices.create({
                index,
                body: {
                    "mappings": {
                        "properties": {
                            "timestamp": {
                                "type": "date",
                            }
                        }
                    }
                }
            })
        }
    }

    async deleteIndex() {
        await this.client.indices.delete({index: this.index});
    }

    async deleteById(id) {
        await this.client.delete({index: this.index, id});
    }

    async editLink(id, name, urlValue, keywords, caption, userId, timestamp) {
        let data = {name, urlValue, keywords, caption, userId, timestamp};
        data['lastEditTime'] = new Date();
        await this.client.index({
            index: this.index,
            id,
            document: data
        })
        await this.client.indices.refresh({index: this.index})
    }

    async addLink(name, urlValue, keywords, caption, userId) {
        let data = {name, urlValue, keywords, caption, userId};
        data['timestamp'] = new Date();
        await this.client.index({
            index: this.index,
            document: data
        })
        await this.client.indices.refresh({index: this.index})
    }


    async prefixSearch(prefix, field, userId) {
        const result = await this.client.search({
            index: this.index,
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


    async prefixSearchMulti(prefix, fields, userId) {
        const result = await this.client.search({
                index: this.index,
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

    async prefixSearchAllFields(prefix, userId) {
        const result = await this.client.search({
                index: this.index,
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


    async mostFrequentKeyword(limit) {
        const result = await this.client.search({
            index: this.index,
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

    async mostFrequentKeywordForUser(userId, limit) {
        const result = await this.client.search({
            index: this.index,
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
}

module.exports = ElasticSearch;