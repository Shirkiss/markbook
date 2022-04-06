const {expect} = require('chai');
const ElasticSearch = require("../../services/elasticsearch");

describe('Elasticsearch tests', function() {
    this.timeout(10000);
    let elasticSearch;

    before(async () => {
        try {
            elasticSearch = new ElasticSearch('test');
            await elasticSearch.init();
            await elasticSearch.addLink('Shirs website', 'www.something.com/id=mai', ['recipe'], 'my first link', 1);
            await elasticSearch.addLink('Williams website', 'www.something.com/id=lio', ['recipe','something'], 'my second link', 1);
            await elasticSearch.addLink('Roys website', 'www.check.com/id=lio', ['shir'], 'my third link', 1);
            await elasticSearch.addLink('lio website', 'www.check.com/id=no', ['shir'], 'my third link', 2);
        } catch {
            await elasticSearch.deleteIndex();
        }
    });

    after(async ()=> {
        await elasticSearch.deleteIndex();
    });

    it('prefixSearchMulti should return correct data', async () => {
        const result = await elasticSearch.prefixSearchMulti('shi', ['name', 'keywords'], 1);
        expect(result.length).to.equal(2);
    })

    it('mostFrequentKeyword should return correct data', async () => {
        const result = await elasticSearch.mostFrequentKeyword(2);
        expect(result).to.deep.equal([
            {
                "key": "recipe",
                "doc_count": 2
            },
            {
                "key": "shir",
                "doc_count": 2
            }
        ]);
    })
});
