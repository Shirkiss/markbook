const express = require('express');
const linksManager = require('./routes/links');
const path = require('path');
const redisManager = require('./redisManager');

const app = express();
redisManager.start();

app.use(express.static(path.join(__dirname, '/build')));

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended: false}));

// parse application/json
app.use(express.json());

app.use('/', linksManager);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(8000, () => {
    console.log('Listening on port 8000');
});
