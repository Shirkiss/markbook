const {expect} = require('chai');
const elasticSearch = require("../../services/elasticsearchManager");
const TEST_INDEX = 'test';

describe('Elasticsearch tests', function() {
    this.timeout(10000);

    before(async () => {
        try {
            await elasticSearch.createIndex(TEST_INDEX);
            await elasticSearch.addDocument({name: 'Shirs website', urlValue: 'www.something.com/id=mai', keywords: ['recipe'], caption: 'my first link', userId: 1}, TEST_INDEX);
            await elasticSearch.addDocument({name: 'Williams website', urlValue: 'www.something.com/id=lio', keywords: ['recipe','something'], caption: 'my second link', userId: 1}, TEST_INDEX);
            await elasticSearch.addDocument({name: 'Roys website', urlValue: 'www.check.com/id=lio', keywords: ['shir'], caption: 'my third link', userId: 1}, TEST_INDEX);
            await elasticSearch.addDocument({name: 'lio website', urlValue: 'www.check.com/id=no', keywords: ['shir', 'sh', 'ketrecipe', 'recket'], caption: 'my fourth link', userId: 2}, TEST_INDEX);
            await elasticSearch.addDocument({name: 'lio website', urlValue: 'www.check.com/id=no', keywords: ['recipe'], caption: 'my fourth link', userId: 2}, TEST_INDEX);
        } catch {
            await elasticSearch.deleteIndex(TEST_INDEX);
        }
    });

    after(async ()=> {
        await elasticSearch.deleteIndex(TEST_INDEX);
    });

    it('prefixSearchMulti should return correct data', async () => {
        const result = await elasticSearch.prefixSearchMulti('shi', ['name', 'keywords'], 1, TEST_INDEX);
        expect(result.length).to.equal(2);
    })

    it('prefixSearchAllFields should return correct data', async () => {
        const result = await elasticSearch.prefixSearchAllFields('shi', 1, TEST_INDEX);
        expect(result.length).to.equal(2);
    })

    it('getAll should return correct data', async () => {
        const result = await elasticSearch.getAll( 1, TEST_INDEX);
        expect(result.length).to.equal(3);
    })

    it('mostFrequentKeywordForUserByPrefix should return correct data', async () => {
        const result = await elasticSearch.mostFrequentKeywordForUserByPrefix(2, 'rec', 4, TEST_INDEX);
        expect(result.length).to.equal(2);
        const result2 = await elasticSearch.mostFrequentKeywordForUserByPrefix(2, 'reci', 4, TEST_INDEX);
        expect(result2.length).to.equal(1);
        expect(result2[0]['doc_count']).to.equal(1);
    })

    it('mostFrequentKeywordByPrefix should return correct data', async () => {
        const result = await elasticSearch.mostFrequentKeywordByPrefix( 'rec', 4, TEST_INDEX);
        expect(result.length).to.equal(2);
        expect(result[0]).to.deep.equal({
            "key": "recipe",
            "doc_count": 3
        });
        const result2 = await elasticSearch.mostFrequentKeywordByPrefix( 'reci', 4, TEST_INDEX);
        expect(result2.length).to.equal(1);
        expect(result2[0]['doc_count']).to.equal(3);

    })

    it('mostFrequentKeyword should return correct data', async () => {
        const result = await elasticSearch.mostFrequentKeyword(2, TEST_INDEX);
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
