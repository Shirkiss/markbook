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

module.exports = {getFavicon}