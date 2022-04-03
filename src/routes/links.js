const express = require('express');
const router = express.Router();
const redisManager = require('../redisManager');

const setHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', 'chrome-extension://midgecoohkdmehedgabcdpbgjjachkkc');
    //res.setHeader('Access-Control-Allow-Origin', 'chrome-extension://hfnlgdgnpbfeobidpfpfhcejkdkocpni'); // MAI's
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
};

router.use('/hello', (req, res) => {
    setHeaders(res);
    console.log('hello');
    res.send({message: 'hello'});
});

router.post('/saveLink/:id', async (req, res) => {
    try {
        const {keywords, urlValue, name, caption, isPrivate} = req.body;
        const userId = req.params.id;
        const keywordsSplit = keywords.split(',');
        const data = {name, keywordsSplit, caption, isPrivate};
        await redisManager.addLink(userId, urlValue, data);
        const links = await redisManager.getAllLinks(userId);
        setHeaders(res);
        console.log('saved link');
        res.send(links);
    } catch (error) {
        res.statusCode(500);
        res.send({message: 'Failed to save link', error});
    }
});

router.post('/editLink/:id', async (req, res) => {
    try {
        const {keywords, urlValue, name, caption, isPrivate, originalUrl} = req.body;
        const userId = req.params.id;
        await redisManager.removeLink(userId, originalUrl);
        const keywordsSplit = keywords.split(',');
        const data = {name, keywordsSplit, caption, isPrivate};
        await redisManager.addLink(userId, urlValue, data);
        const links = await redisManager.getAllLinks(userId);
        setHeaders(res);
        console.log('saved link');
        res.send(links);
    } catch (error) {
        res.statusCode(500);
        res.send({message: 'Failed to save link', error});
    }
});

router.use('/removeLink/:id', async (req, res) => {
    try {
        setHeaders(res);
        let {urlValue} = req.body;
        const userId = req.params.id;
        await redisManager.removeLink(userId, urlValue);
        const links = await redisManager.getAllLinks(userId);
        console.log('removed link');
        res.send(links);
    } catch (error) {
        res.statusCode(500);
        res.send({message: 'Failed to remove link', error});
    }
});

router.use('/removeAllLinks/:id', async (req, res) => {
    try {
        setHeaders(res);
        const userId = req.params.id;
        await redisManager.removeAllLinks(userId);
        console.log('removed all links');
        res.send({message: 'All links removed successfully'});
    } catch (error) {
        res.statusCode(500);
        res.send({message: 'Failed to remove all links', error});
    }
});

router.use('/getAllLinks/:id', async (req, res) => {
    setHeaders(res);
    const userId = req.params.id;
    const links = await redisManager.getAllLinks(userId);
    console.log('sent all links');
    res.send(links);
});

router.use('/getLink/:id', async (req, res) => {
    try {
        setHeaders(res);
        let {urlValue} = req.body;
        const userId = req.params.id;
        const link = await redisManager.getLink(userId, urlValue);
        res.send(link);
    } catch (error) {
        res.statusCode(500);
        res.send({message: 'Failed to get link', error});
    }
});


module.exports = router;
