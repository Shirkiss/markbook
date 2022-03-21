const express = require('express');
const bodyParser = require('body-parser');
const linksManager = require('./routes/links');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json());
app.use('/', linksManager);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(8000, () => {
    console.log('Listening on port 8000');
});
