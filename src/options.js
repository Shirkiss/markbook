function save_options() {
    let userName = document.getElementById('userName').value;
    let isPrivate = document.getElementById('isPrivate').checked;

    chrome.storage.sync.get('userId', ({userId}) => {
        const field = 'name';
        const value = userName;
        const data = new URLSearchParams({field, value});
        // update in redis.
        const fetchData = async () => {
            await fetch(`http://localhost:8000/user/addUserInfoField/${userId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: data
            });
        };
        fetchData();
    })

    // update on chrome.storage
    chrome.storage.sync.set({
        isPrivate
    }, function () {
        // Update status to let user know options were saved.
        let status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    chrome.storage.sync.get('userId', ({userId}) => {
        const field = 'name';
        // stored in redis.
        const fetchData = async () => {
            await fetch(`http://localhost:8000/user/getUserInfoField/${userId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({field})
            }).then((response) => {
                response.json().then(result => {
                    document.getElementById('userName').value = result.name;
                });
            });
        };
        fetchData();
        // stored in chrome.storage.
        chrome.storage.sync.get({
            isPrivate: false,
        }, function (items) {
            document.getElementById('isPrivate').checked = items.isPrivate;
        });
    })
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);