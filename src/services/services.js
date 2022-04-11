const getFavicon = (fullUrl) => {
    let favicon = '';
    try {
        const url = new URL(fullUrl);
        const baseUrl = `${url.protocol}//${url.hostname}`;
        const faviconPrefix = '/favicon.ico';
        favicon = baseUrl + faviconPrefix;
    } catch (error) {
        console.log('could not get favicon url');
    }
    return favicon;
}

const setHeaders = (req, res, next) => {
    // res.setHeader('Access-Control-Allow-Origin', 'chrome-extension://midgecoohkdmehedgabcdpbgjjachkkc');
    res.setHeader('Access-Control-Allow-Origin', 'chrome-extension://hfnlgdgnpbfeobidpfpfhcejkdkocpni'); // MAI's
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    return next();
}

module.exports = {getFavicon, setHeaders}