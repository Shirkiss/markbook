const {expect} = require('chai');
const ElasticSearch = require("../../services/elasticsearchManager");

describe('Elasticsearch tests', function() {
    this.timeout(10000);
    let elasticSearch;

    before(async () => {
        try {
            elasticSearch = new ElasticSearch('test');
            await elasticSearch.init();
            await elasticSearch.addLink({name: 'Shirs website', urlValue: 'www.something.com/id=mai', keywords: ['recipe'], caption: 'my first link', userId: 1});
            await elasticSearch.addLink({name: 'Williams website', urlValue: 'www.something.com/id=lio', keywords: ['recipe','something'], caption: 'my second link', userId: 1});
            await elasticSearch.addLink({name: 'Roys website', urlValue: 'www.check.com/id=lio', keywords: ['shir'], caption: 'my third link', userId: 1});
            await elasticSearch.addLink({name: 'lio website', urlValue: 'www.check.com/id=no', keywords: ['shir', 'sh', 'ketrecipe', 'recket'], caption: 'my fourth link', userId: 2});
            await elasticSearch.addLink({name: 'lio website', urlValue: 'www.check.com/id=no', keywords: ['recipe'], caption: 'my fourth link', userId: 2});
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

    it('prefixSearchAllFields should return correct data', async () => {
        const result = await elasticSearch.prefixSearchAllFields('shi', 1);
        expect(result.length).to.equal(2);
    })

    it('getAll should return correct data', async () => {
        const result = await elasticSearch.getAll( 1);
        expect(result.length).to.equal(3);
    })

    it('mostFrequentKeywordForUserByPrefix should return correct data', async () => {
        const result = await elasticSearch.mostFrequentKeywordForUserByPrefix(2, 'rec', 4);
        expect(result.length).to.equal(2);
        const result2 = await elasticSearch.mostFrequentKeywordForUserByPrefix(2, 'reci', 4);
        expect(result2.length).to.equal(1);
        expect(result2[0]['doc_count']).to.equal(1);
    })

    it('mostFrequentKeywordByPrefix should return correct data', async () => {
        const result = await elasticSearch.mostFrequentKeywordByPrefix( 'rec', 4);
        expect(result.length).to.equal(2);
        expect(result[0]).to.deep.equal({
            "key": "recipe",
            "doc_count": 3
        });
        const result2 = await elasticSearch.mostFrequentKeywordByPrefix( 'reci', 4);
        expect(result2.length).to.equal(1);
        expect(result2[0]['doc_count']).to.equal(3);

    })

    it('mostFrequentKeyword should return correct data', async () => {
        const result = await elasticSearch.mostFrequentKeyword(2);
        expect(result).to.deep.equal([
            {
                "key": "recipe",
                "doc_count": 3
            },
            {
                "key": "shir",
                "doc_count": 2
            }
        ]);
    })
});
