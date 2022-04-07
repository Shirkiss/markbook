const {expect} = require('chai');
const ElasticSearch = require("../../services/elasticsearch");
const keywordsSuggestionService = require("../../services/keywordsSuggestionService");

describe('keywordsSuggestionService.js tests', function() {
    this.timeout(10000);
    let elasticSearch;

    before(async () => {
        try {
            elasticSearch = new ElasticSearch('keywords-test');
            await elasticSearch.init();
            await elasticSearch.addLink('Shirs website', 'www.something.com/id=mai', ['recipe'], 'my first link', 1);
            await elasticSearch.addLink('Williams website', 'www.something.com/id=lio', ['recipe','something'], 'my second link', 1);
            await elasticSearch.addLink('Roys website', 'www.check.com/id=lio', ['shir', 'something'], 'my third link', 1);
            await elasticSearch.addLink('lio website', 'www.check.com/id=no', ['shir', 'sh', 'ketrecipe', 'recket'], 'my fourth link', 2);
            await elasticSearch.addLink('lio website', 'www.check.com/id=no', ['recipe'], 'my fourth link', 2);
            await elasticSearch.addLink('lio website', 'www.check.com/id=no', ['shsh', 'sholem', 'rr'], 'my fourth link', 2);
            await elasticSearch.addLink('lio website', 'www.check.com/id=no', ['shsh'], 'my fourth link', 2);
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
