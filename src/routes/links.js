const express = require('express');
const router = express.Router();
const redisManager = require('../redisManager');

const setHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', 'chrome-extension://midgecoohkdmehedgabcdpbgjjachkkc');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
};

router.use('/hello', (req, res) => {
    setHeaders(res);
    console.log("hello");
    res.send({message: "hello"});
});

router.post('/saveLink/:id', (req, res) => {
    let {keywords, link, name, comment} = req.body;
    const userId = req.params.id;
    let keywordsSplit = keywords.split(",");
    redisManager.addLink(userId, link, name, keywordsSplit, comment);
    setHeaders(res);
    console.log("saved link");
    res.send({message: "Link saved successfully"});
});

router.use('/removeLink/:id', (req, res) => {
    setHeaders(res);
    let {url} = req.body;
    const userId = req.params.id;
    redisManager.removeLink(userId, url);
    setHeaders(res);
    console.log("removed link");
    res.send({message: "Link removed successfully"});
});

router.use('/getAllLinks/:id', async (req, res) => {
    setHeaders(res);
    const userId = req.params.id;
    const links = await redisManager.getAllLinks(userId);
    console.log("sent all links");
    res.send({links});
});


module.exports = router;
