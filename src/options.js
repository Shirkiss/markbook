// Saves options to chrome.storage
function save_options() {
    var userName = document.getElementById('userName').value;
    var isPrivate = document.getElementById('isPrivate').checked;
    chrome.storage.sync.set({
        userName,
        isPrivate
    }, function() {
        // Update status to let user know options were saved.
        let status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get('userEmail', ({userEmail}) => {
        chrome.storage.sync.get({
            isPrivate: false,
            userName: userEmail
        }, function(items) {
            document.getElementById('userName').value = items.userName;
            document.getElementById('isPrivate').checked = items.isPrivate;
        });
    })
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);