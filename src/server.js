const express = require('express');
const linksManager = require('./routes/links');
const userManager = require('./routes/user');
const path = require('path');
const redisManager = require('./services/redisManager');
const services = require('./services/services');

const app = express();
redisManager.start();

app.use(express.static(path.join(__dirname, '/build')));

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended: false}));

// parse application/json
app.use(express.json());

app.use('/links', linksManager);
app.use('/user', userManager);
app.use('/getFavicon', [services.getFaviconFromServer]);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(8000, () => {
    console.log('Listening on port 8000');
});
