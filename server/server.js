// Include the cluster module
var appConfig = require('./app/config/app_config');


// set up ======================================================================
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    errorHandlingModule = require('./app/modules/error_handling_module'),
    logging = require('./app/modules/log-module'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    fileUpload = require('express-fileupload');;

// configuration ===============================================================
var port = appConfig.port,
    urlPrefix = appConfig.context_root;
console.log('urlPrefix: ' + urlPrefix);
console.log('Environment: ' + process.env.NODE_ENV || 'PRODUCTION');

// this is needed only on developers machine
if (process.env.NODE_ENV === 'development') {
    app.use(function (req, res, next) {
        //res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Origin", "http://localhost:8888");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
}

app.use(cookieParser());

//client side files serving
app.use(urlPrefix + '/public', express.static('./public'));
app.use(urlPrefix + '/public', express.static(path.join(__dirname, 'public')));



//logger
logging.createLogger(app);
app.use(logging.requestLogging);
app.use(fileUpload());

app.use(bodyParser.urlencoded({
    'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request

// routes ======================================================================
var applicationRoute = require('./app/routes.js');
app.use(urlPrefix, applicationRoute);

//api routes
appConfig.route.init(app, urlPrefix);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);

//error handler
errorHandlingModule.init(app);