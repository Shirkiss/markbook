let links = {};
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ links });
});
