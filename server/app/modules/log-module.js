var fs = require('fs-extra');
var path = require('path');
var appConfig = require('../config/app_config');
var expressBunyanLogger = require('express-bunyan-logger');
var mkdirp = require('mkdirp');

var paymentsLogDir = path.resolve(__dirname, '..', '..', 'log', 'payments');
fs.ensureDirSync(paymentsLogDir);
var securityLogsDir = path.resolve(__dirname, '..', '..', 'log', 'security');
fs.ensureDirSync(securityLogsDir);

exports.responseLogging = function logResponseBody(req, res, next) { };

exports.requestLogging = function logRequestBody(req, res, next) {
    try {
        delete req.headers.cookie;
        var requestData = {
            header: req.headers,
            formData: req.body
        };
        req.log.debug({
            url: req.url,
            time: new Date(),
            data: requestData
        }, 'MYPOSTBOX_REQUEST');
    } catch (Exception) { }

    next();
};

exports.createLogger = function (app) {

    //create log folders if not exsist
    var errorBaseDir = path.join(__dirname, appConfig.log.errorBasePath);
    var debugBaseDir = path.join(__dirname, appConfig.log.debugBasePath);
    mkdirp(debugBaseDir, function (err) {
        if (err) console.error(err);
        else console.log('debug directory is created/exsist!');
    });
    mkdirp(errorBaseDir, function (err) {
        if (err) console.error(err);
        else console.log('error directory created/exsist!');
    });

    var serializers = {
        req: function reqSerializer(req) {
            if (!req || !req.connection) {
                return req;
            }

            var requestData = {
                url: req.url,
                method: req.method,
                protocol: req.protocol,
                requestId: req.requestId,

                // In case there's a proxy server:
                ip: req.headers['x-forwarded-for'] ||
                    req.connection.remoteAddress,
                headers: req.headers
            };

            console.log({
                type: 'Request',
                url: req.url,
                method: req.method
            });
            return requestData;
        },
        res: function resSerializer(res) {
            if (!res) {
                return res;
            }
            console.log({
                type: 'Response',
                url: res.req.url,
                method: res.req.method,
                statusCode: res.statusCode
            });
            return {
                statusCode: res.statusCode,
                headers: res._header,
                requestId: res.requestId,
                responseTime: res.responseTime
            };
        },
        err: function errSerializer(err) {
            if (!err || !err.stack) {
                return err;
            }

            console.log({
                type: 'Error',
                message: err.message,
                code: err.code,
                name: err.name
            });
            return {
                message: err.message,
                name: err.name,
                stack: getFullStack(err),
                code: err.code,
                signal: err.signal,
                requestId: err.requestId
            };
        }
    };

    app.use(expressBunyanLogger({
        name: 'my_postbox_logger',
        streams: [{
            type: 'rotating-file',
            level: 'error',
            path: path.join(__dirname, appConfig.log.errorPath),
            period: 'daily',
            count: 30
        },
        {
            type: 'rotating-file',
            level: 'debug',
            path: path.join(__dirname, appConfig.log.debugPath),
            period: 'daily',
            count: 30
        }
        ],
        serializers: serializers
    }));

};


exports.logPayment = function (paymentDetails) {
    paymentDetails.timestamp = (new Date()).toLocaleString();
    fs.appendFile(path.resolve(paymentsLogDir, 'payments.log'),
        JSON.stringify(paymentDetails) + "\n", function (err) {
            if (err) {
                console.log(err)
            }
        });
}

exports.logSecurity = function (securityDetails) {
    securityDetails.timestamp = (new Date()).toLocaleString();
    fs.appendFile(path.resolve(securityLogsDir, 'security.log'),
        JSON.stringify(securityDetails) + "\n", function (err) {
            if (err) {
                console.log(err)
            }
        });
}