const {getFavicon} = require('./services/services');
const IMPORTED_BOOKMARK_CAPTION = 'imported bookmark';

function import_bookmarks() {
    chrome.bookmarks.getTree((bookmarkTreeNode) => {

            chrome.storage.sync.get(['userId', 'isPrivate'], (items) => {
                const bookmarkTree = bookmarkTreeNode[0]['children'][0];
                const bookmarks = scanNodes(bookmarkTree);
                const formattedBookmarks = bookmarks.map((bookmark) => {
                    return {
                        name: bookmark.title,
                        urlValue: bookmark.url,
                        favIconUrl: getFavicon(bookmark.url),
                        isPrivate: items.isPrivate,
                        caption: IMPORTED_BOOKMARK_CAPTION
                    }
                });

                const linksArray = JSON.stringify(formattedBookmarks);

                const fetchData = async () => {
                    await fetch(`http://localhost:8000/links/saveLinks/${items.userId}`, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams({linksArray})
                    });
                };
                fetchData();
            })
        }
    )
}

const scanNodes = function (tree) {
    const treeChildren = tree['children'];
    let urls = [];
    if (treeChildren && treeChildren.length) {
        treeChildren.forEach((node) => {
            if (!node.url) {
                urls = urls.concat(scanNodes(node));
            } else {
                urls.push(node);
            }
        })
    }
    return urls;
}


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
document.getElementById('import_bookmarks').addEventListener('click',
    import_bookmarks);