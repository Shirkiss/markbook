let getFavicons = require('get-website-favicon');

function omnibarDataFormatter(data) {
    const result = [];
    for (let i = 0; i < data.length; ++i) {
        let content = {
            content: `${data[i]['_source']['name']}, url: ${data[i]['_source']['urlValue']}`,
            deletable: false,
            description: `${data[i]['_source']['name']} | ${data[i]['_source']['urlValue']}`
        };
        result.push(content);
    }
    return result;
}

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

const getWordsWithPrefixFromText = (text, prefix) => {

    const regex = new RegExp('\\' + prefix + '\\S+', 'g');
    const matches = [];
    let match;

    while (match = regex.exec(text)) {
        matches.push(match[0]);
    }
    return matches;
}

const setHeaders = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    return next();
}


module.exports = {getFaviconFromUrl, setHeaders, getFaviconFromServer, omnibarDataFormatter, getWordsWithPrefixFromText}