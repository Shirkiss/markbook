const {omnibarDataFormatter} = require('./services/services');
const URL_PREFIX = 'url: '

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({links: {}});
    chrome.identity.getProfileUserInfo(async function (userInfo) {
        const name = userInfo.email.split('@')[0];
        const email = userInfo.email;
        const data = new URLSearchParams({
            name, email
        });
        await chrome.storage.sync.set({userId: userInfo.id, email, name});
        await fetch(`http://localhost:8000/user/addUserInfo/${userInfo.id}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: data
        });
    });
});

chrome.omnibox.setDefaultSuggestion({
    description: 'Select from your <match>Markbooks</match> or search on <match>Google</match>'
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    chrome.storage.sync.get('userId', ({userId}) => {
        let data = new URLSearchParams({prefix: text});
        fetch(`http://localhost:8000/links/searchAll/${userId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: data,
        })
            .then((response) => response.json())
            .then((data) => {
                if (!data.length) {
                    //no markbooks were found
                    suggest([]);
                } else {
                    const result = omnibarDataFormatter(data);
                    suggest(result);
                }
            })
    });
});

chrome.omnibox.onInputEntered.addListener((text) => {
    const prefixIndex = text.indexOf(URL_PREFIX);
    if (prefixIndex !== -1) {
        chrome.tabs.create({url: text.substring(prefixIndex + URL_PREFIX.length)}, () => {
        });
    } else {
        chrome.search.query({text}, () => {
        })
    }
});