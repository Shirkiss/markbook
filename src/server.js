const express = require('express');
const linksManager = require('./routes/links');
const userManager = require('./routes/user');
const friendsManager = require('./routes/friends');
const groupsManager = require('./routes/groups');
const keywordsManager = require('./routes/keywords');
const path = require('path');
const redisManager = require('./services/redisManager');
const services = require('./services/services');
const neo4jManager = require('../services/neo4jManager');
await neo4jManager.init();

const app = express();
redisManager.start();

app.use(express.static(path.join(__dirname, '/build')));

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended: false}));

// parse application/json
app.use(express.json());

app.use('/links', linksManager);
app.use('/user', userManager);
app.use('/keywords', keywordsManager);
app.use('/friends', friendsManager);
app.use('/groups', groupsManager);

app.use('/getFavicon', [services.getFaviconFromServer]);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(8000, () => {
    console.log('Listening on port 8000');
});
