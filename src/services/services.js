let getFavicons = require('get-website-favicon');

const getFaviconFromServer = (req, res, next) => {
    const {url} = req.body;
    setHeaders(req, res, next);
    getFavicons(url).then(data => {
        if (data) {
            let faviconUrl = data['icons']?.[0]?.['src'];
            if (!faviconUrl) {
                faviconUrl = getFaviconFromUrl(url);
            }
            res.send(faviconUrl);
        } else {
            res.status(500).send('could not get favicon url');
        }
    })
    return next();
}

const getFaviconFromUrl = (fullUrl) => {
    let favicon = '';
    try {
        favicon = 'https://t3.gstatic.com/faviconV2?client=SOCIAL&size=64&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=' + fullUrl;
    } catch (error) {
        console.log('could not get favicon url');
    }
    return favicon;
}

const setHeaders = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    return next();
}

module.exports = {getFaviconFromUrl, setHeaders, getFaviconFromServer}