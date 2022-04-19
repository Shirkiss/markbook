const {expect} = require('chai');
const ElasticSearch = require("../../services/elasticsearchManager");
const keywordsSuggestionService = require("../../services/keywordsSuggestionService");

describe('keywordsSuggestionService.js tests', function() {
    this.timeout(10000);
    let elasticSearch;

    before(async () => {
        try {
            elasticSearch = new ElasticSearch('keywords-test');
            await elasticSearch.init();

            await elasticSearch.addLink({name: 'Shirs website', urlValue: 'www.something.com/id=mai', keywords: ['recipe'], caption: 'my first link', userId: 1});
            await elasticSearch.addLink({name: 'Williams website', urlValue: 'www.something.com/id=lio', keywords: ['recipe','something'], caption: 'my second link', userId: 1});
            await elasticSearch.addLink({name: 'Roys website', urlValue: 'www.check.com/id=lio', keywords: ['shir'], caption: 'my third link', userId: 1});
            await elasticSearch.addLink({name: 'lio website', urlValue: 'www.check.com/id=no', keywords: ['shir', 'sh', 'ketrecipe', 'recket'], caption: 'my fourth link', userId: 2});
            await elasticSearch.addLink({name: 'lio website', urlValue: 'www.check.com/id=no', keywords: ['recipe'], caption: 'my fourth link', userId: 2});
            await elasticSearch.addLink({name: 'lio website', urlValue: 'www.check.com/id=no', keywords: ['shsh', 'sholem', 'rr'], caption: 'my fourth link', userId: 2});
            await elasticSearch.addLink({name: 'lio website', urlValue: 'www.check.com/id=no', keywords: ['shsh'], caption: 'my fourth link', userId: 2});
        } catch {
            await elasticSearch.deleteIndex();
        }
    });

    after(async ()=> {
        await elasticSearch.deleteIndex();
    });

    it('getKeywordsSuggestion should return correct data', async () => {
        const result = await keywordsSuggestionService.getKeywordsSuggestion(1, '');
        expect(result.length).to.equal(18);
        expect(result[0]).to.equal('recipe');
        const result2 = await keywordsSuggestionService.getKeywordsSuggestion(1, 's');
        expect(result2.length).to.equal(9);
        expect(result2[0]).to.equal('something');
    })

    it('getInitialKeywordsSuggestion should return correct data', async () => {
        const result = await keywordsSuggestionService.getInitialKeywordsSuggestion(1);
        expect(result.length).to.equal(4);
        expect(result[0]).to.equal('recipe');
        const result2 = await keywordsSuggestionService.getInitialKeywordsSuggestion(2);
        expect(result2.length).to.equal(4);
        expect(result2[0]).to.equal('shir');
    })

    it('getGeneralKeywordsSuggestion should return correct data', async () => {
        expect (await keywordsSuggestionService.getInitialKeywordsSuggestion(1)).to.be.deep.equal(await keywordsSuggestionService.getGeneralKeywordsSuggestion(1, '', 4))
        expect (await keywordsSuggestionService.getKeywordsSuggestion(1, 's')).to.be.deep.equal(await keywordsSuggestionService.getGeneralKeywordsSuggestion(1, 's', 20))
    })
});
