const {expect} = require('chai');
const {getFaviconFromUrl, getWordsWithPrefixFromText} = require('../../services/services');

describe('services tests', () => {
    it('Should return favicon url', () => {
        const baseUrl = 'https://www.someurl.com';
        const additionalInfo = '/some/other?some=id&something=logic';
        const faviconPrefix = '/favicon.ico';
        expect(getFaviconFromUrl(baseUrl + additionalInfo)).to.deep.equal(baseUrl + faviconPrefix);
    });

    it('Should return all keywords', () => {
        const text = '#keywords #keywords2 something something @group word prefixfds @groupwith#inside #keywordwith@inside';
        expect(getWordsWithPrefixFromText(text, '#')).to.deep.equal(['keywords', 'keywords2', 'inside', 'keywordwith@inside']);
    });
});
