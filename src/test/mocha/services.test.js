const {expect} = require('chai');
const {getFavicon} = require('../../services/services');

describe('services tests', () => {
    it('Should return favicon url', () => {
        const baseUrl = 'https://www.someurl.com';
        const additionalInfo = '/some/other?some=id&something=logic';
        const faviconPrefix = '/favicon.ico';
        expect(getFavicon(baseUrl + additionalInfo)).to.deep.equal(baseUrl + faviconPrefix);
    });
});
