const express = require('express');
const router = express.Router();
const redisManager = require('../redisManager');

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

router.post('/saveLink', (req, res) => {
    let {keywords, url, name, comment} = req.body;
    let keywordsSplit = keywords.split(",");
    redisManager.addLink(url, name, keywordsSplit, comment);
    setHeaders(res);
    console.log("saved link");
    res.send({message: "Link saved successfully"});
});

router.use('/removeLink', (req, res) => {
    setHeaders(res);
    let {url} = req.body;
    redisManager.removeLink(url);
    setHeaders(res);
    console.log("removed link");
    res.send({message: "Link removed successfully"});
});

router.use('/getAllLinks', async (req, res) => {
    setHeaders(res);
    const links = await redisManager.getAllLinks();
    console.log("sent all links");
    res.send({links});
});


module.exports = router;
