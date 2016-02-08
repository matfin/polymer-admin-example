/**
 *  Required modules
 */
var express         = require('../node_modules/express'),
    app             = express(),
    path            = require('path'),
    jsonserver      = require('../node_modules/json-server'),
    server          = jsonserver.create(),
    router          = jsonserver.router('demo-server/db.json'),
    cookieParser    = require('../node_modules/cookie-parser'),
    session         = require('../node_modules/express-session'),
    http;

/**
 *  Security
 */
server.use(cookieParser('security', {'path': '/'}));
app.use(cookieParser('security', {'path': '/'}));

server.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS');
    res.setHeader('Access-Control-Expose-Headers', 'Access-Control-Allow-Origin');
    res.setHeader('Access-Control-Allow-Headers', 'X-Custom-Header,X-Requested-With,X-Prototype-Version,Content-Type,Cache-Control,Pragma,Origin,content-type');

    if(!req.signedCookies.usersession && req._parsedUrl.pathname !== '/auth/login' && req.method !== 'OPTIONS') {
        res.redirect('http://localhost:8080/app/pages/auth/auth.html');
    }
    else {
        next();
    }
});

server.post('/auth/login', function(req, res) {
    var users       = router.db.object.users,
        username    = req.query.username,
        password    = req.query.password,
        found       = false;

    users.forEach(function(user) {
        if(user.username === username && user.password === password) {
            res.cookie('usersession', user.id, {maxAge: 9000000, httpOnly: false, signed: true});
            res.send(JSON.stringify({success:true}));
            found = true;
        }
    });

    if(!found) {
        res.send(JSON.stringify({success: false, error: 'Invalid username and/or password.'}));
    }
});

/**
 *  Get user profile data
 */
server.get('/profile', function(req, res) {
    var userId  = req.signedCookies.usersession,
        users   = router.db.object.profiles;

    for(var i = 0; i < users.length; i++) {
        if(users[i].userId === parseInt(userId)) {
            res.send(JSON.stringify(users[i]));
            return;
        }
    }
    res.send();
});

/**
 *  Logout handler
 */
app.get('/auth/logout', function(req, res){
    console.log('Caught auth logout');
    res.clearCookie('usersession');
    res.redirect('/app/pages/auth/auth.html');
});

/**
 *  Loading the static index.html file
 */
app.get('/', function(req, res) {
    if(!req.signedCookies.usersession) {
        res.redirect('app/pages/auth/auth.html');
    }
    else {
        res.sendFile(path.join(__dirname + '/../app/index.html'));
    }
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

/**
 *  JSON server
 */
server.use(jsonserver.defaults);
server.use(router);
server.listen(5000);