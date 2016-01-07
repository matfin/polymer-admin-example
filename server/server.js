/**
 *  Required modules
 */
var express = require('../node_modules/express'),
    app     = express(),
    path    = require('path'),
    http;

/**
 *  Loading the static index.html file
 */
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/../app/index.html'));
});

/**
 *  Setting the static path
 */
app.use(express.static(path.join(__dirname, '../')));

/**
 *  Kicking off the server on port 8080
 */
http = require('http').Server(app);
http.listen(8080);