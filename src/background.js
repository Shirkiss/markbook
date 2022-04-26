chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({links: {}});
    chrome.identity.getProfileUserInfo(async function (userInfo) {
        const name = userInfo.email.split('@')[0];
        const email = userInfo.email;
        const data = new URLSearchParams({
            name, email
        });
        await chrome.storage.sync.set({userId: userInfo.id, email, name});
        const response = await fetch(`http://localhost:8000/user/addUserInfo/${userInfo.id}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: data
        });
    });
});
