const {expect} = require('chai');
const elasticSearch = require("../../services/elasticsearchManager");
const keywordsSuggestionService = require("../../services/keywordsSuggestionService");
const KEYWORD_TEST = 'keywords-test';

describe('keywordsSuggestionService.js tests', function() {
    this.timeout(10000);

    before(async () => {
        try {
            await elasticSearch.createIndex(KEYWORD_TEST);
            await elasticSearch.addDocument({name: 'Shirs website', urlValue: 'www.something.com/id=mai', keywords: ['recipe'], caption: 'my first link', userId: 1}, KEYWORD_TEST);
            await elasticSearch.addDocument({name: 'Williams website', urlValue: 'www.something.com/id=lio', keywords: ['recipe','something'], caption: 'my second link', userId: 1}, KEYWORD_TEST);
            await elasticSearch.addDocument({name: 'Roys website', urlValue: 'www.check.com/id=lio', keywords: ['shir', 'something'], caption: 'my third link', userId: 1}, KEYWORD_TEST);
            await elasticSearch.addDocument({name: 'lio website', urlValue: 'www.check.com/id=no', keywords: ['shir', 'sh', 'ketrecipe', 'recket'], caption: 'my fourth link', userId: 2}, KEYWORD_TEST);
            await elasticSearch.addDocument({name: 'lio website', urlValue: 'www.check.com/id=no', keywords: ['recipe'], caption: 'my fourth link', userId: 2}, KEYWORD_TEST);
            await elasticSearch.addDocument({name: 'lio website', urlValue: 'www.check.com/id=no', keywords: ['shsh', 'sholem', 'rr'], caption: 'my fourth link', userId: 2}, KEYWORD_TEST);
            await elasticSearch.addDocument({name: 'lio website', urlValue: 'www.check.com/id=no', keywords: ['shsh'], caption: 'my fourth link', userId: 2}, KEYWORD_TEST);
        } catch {
            await elasticSearch.deleteIndex(KEYWORD_TEST);
        }
    });

    after(async ()=> {
        await elasticSearch.deleteIndex(KEYWORD_TEST);
    });

    it('getKeywordsSuggestion should return correct data', async () => {
        const result = await keywordsSuggestionService.getKeywordsSuggestion(1, '', KEYWORD_TEST);
        expect(result.length).to.equal(12);
        expect(result[0]).to.equal('recipe');
        const result2 = await keywordsSuggestionService.getKeywordsSuggestion(1, 's', KEYWORD_TEST);
        expect(result2.length).to.equal(7);
        expect(result2[0]).to.equal('something');
    })

    it('getInitialKeywordsSuggestion should return correct data', async () => {
        const result = await keywordsSuggestionService.getInitialKeywordsSuggestion(1, KEYWORD_TEST);
        expect(result.length).to.equal(4);
        expect(result[0]).to.equal('recipe');
        const result2 = await keywordsSuggestionService.getInitialKeywordsSuggestion(2, KEYWORD_TEST);
        expect(result2.length).to.equal(4);
        expect(result2[0]).to.equal('shsh');
    })

    it('getGeneralKeywordsSuggestion should return correct data', async () => {
        expect (await keywordsSuggestionService.getInitialKeywordsSuggestion(1, KEYWORD_TEST)).to.be.deep.equal(await keywordsSuggestionService.getGeneralKeywordsSuggestion(1, '', 4, KEYWORD_TEST))
        expect (await keywordsSuggestionService.getKeywordsSuggestion(1, 's', KEYWORD_TEST)).to.be.deep.equal(await keywordsSuggestionService.getGeneralKeywordsSuggestion(1, 's', 20, KEYWORD_TEST))
    })
});
