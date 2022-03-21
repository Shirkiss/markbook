const express = require('express');
const router = express.Router();

const setHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', 'chrome-extension://midgecoohkdmehedgabcdpbgjjachkkc');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
}

router.use('/hello', (req, res) => {
    setHeaders(res);
    console.log("hello");
    res.send({message: "hello"});
});

router.use('/saveLink', (req, res) => {
    setHeaders(res);
    chrome.storage.sync.get("links", ({links}) => {
        let {keywords, url, name, comment} = req.body;
        links[url] = {name, keywords, comment};
        chrome.storage.sync.set({links});
    });
    console.log("saved link");
    res.send({message: "Link saved successfully"});
});

router.use('/removeLink', (req, res) => {
    setHeaders(res);
    chrome.storage.sync.get("links", ({links}) => {
        delete links[urlBox.value];
        chrome.storage.sync.set({links});
        console.log(JSON.stringify(links));
    });
    console.log("removed link");
    res.send({message: "Link removed successfully"});
});

router.use('/getAllLinks', (req, res) => {
    setHeaders(res);
    chrome.storage.sync.get("links", ({links}) => {
        res.send({links});
    });
});


module.exports = router;
