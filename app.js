var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var oauth2 = require('./oauth2');
var passport = require('passport');
var config = require('./config/config.js');
var auth = require('./auth');
var path = require("path");
var fs = require("fs");
var schedule = require('./services/schedule');

var app = express();

/**
 * Middleware Setup
 */


var allowCrossDomain = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
    next();
};
app.use(logger('dev')); //logging for express
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '10mb'
}));
app.use(bodyParser.json({
    limit: '10mb'
}));
app.use(cookieParser());
app.use(allowCrossDomain);
app.use(passport.initialize());


app.passport = passport;

/**
 * Register the routes the app will use
 */

var routePath = path.join(__dirname, 'routes');
fs
    .readdirSync(routePath)
    .filter(function (file) {
        return (file.indexOf('.js') == file.length - 3) && (file !== 'index.js');
    })
    .forEach(function (file) {
        var route = require(path.join(routePath, file))(app);
        var routeName = path.basename(file, '.js');
        app.use(config.serviceBaseURL + '/' + routeName, route);
    });


var index = require('./routes/index')(app);
app.use(config.serviceBaseURL + '/', index);
app.post(config.serviceBaseURL + '/oauth/token', oauth2.token);

var devPublicPath = path.normalize(path.join(__dirname, '..', 'SnowEventsApp', config.angularServeSource));

if (fs.existsSync(devPublicPath)) {
    app.use(express.static(devPublicPath));
} else if (fs.existsSync('public')) {
    app.use(express.static('public'));
} else if (fs.existsSync('static')) {
    app.use(express.static('static'));
}

schedule.emailHelper();

module.exports = app;
