chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ links: {} });
    chrome.identity.getProfileUserInfo(function(userInfo) {
        chrome.storage.sync.set({ userId: userInfo.id, userEmail: userInfo.email });
    });
});
