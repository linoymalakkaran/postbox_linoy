var appConfig = require('../config/app_config'),
    fs = require('fs'),
    path = require('path');

function LogController() {
    var that = this;

    that.getDebugLog = function (req, res, next) {

        var urlLogPath = '/renewpostbox/log/debug';
        var errorLogPath = '/renewpostbox/log/error';
        if (appConfig.isDebugMode) {
            urlLogPath = '/testing_renewpostbox/log/debug';
        }
        var debugPath = appConfig.log.debugPath;
        if (req.body.fileName) {
            debugPath = appConfig.log.debugBasePath + req.body.fileName;
        }
        var filePath = path.join(__dirname + '/' + debugPath);
        requestType = 'RENEW_REQUEST';
        responseType = 'RENEW_RESPONSE';
        if (req.body.requestType) {
            requestType = req.body.requestType;
        }
        if (req.body.responseType) {
            responseType = req.body.responseType;
        }
        readFile(filePath, function (logData) {
            var filteredLog = logData.filter(function (x) {
                return ((x.msg === requestType || x.msg === responseType) && x.url !== urlLogPath && x.url !== errorLogPath);
            });
            filteredLog = filteredLog.map(function (item) {
                if (item.data)
                    delete item.data.header;
                return {
                    type: item.msg,
                    hostname: item.hostname,
                    url: item.url,
                    time: item.time,
                    data: item.data
                };
            });
            res.status(200).send(filteredLog);
            return next();
        });

    };

    that.getErrorLog = function (req, res, next) {
        var errorPath = '';
        var urlLogPath = '/renewpostbox/log/error';
        if (appConfig.isDebugMode) {
            urlLogPath = '/testing_renewpostbox/log/error';
        }
        if (req.body.fileName) {
            errorPath = appConfig.log.errorBasePath + req.body.fileName;
        } else {
            errorPath = appConfig.log.errorPath;
        }
        var filePath = path.join(__dirname + '/' + errorPath);
        readFile(filePath, function (logData) {
            var filteredLog = logData.filter(function (x) {
                return (x.url !== urlLogPath);
            });
            filteredLog = filteredLog.map(function (item) {
                return {
                    type: item.msg,
                    hostname: item.hostname,
                    url: item.url,
                    requestId: item.req_id,
                    time: item.time,
                    data: item.data
                };
            });
            res.status(200).send(filteredLog);
            return next();
        });
    };

    function readFile(filePath, callback) {
        var fileContent = fs.readFileSync(filePath, 'utf8');
        fileContent = fileContent.replace(/(?:\r\n|\r|\n)/g, ',');
        fileContent = '[' + fileContent + ']';
        fileContent = fileContent.replace('},]', '}]');
        callback(JSON.parse(fileContent));
    }
}
module.exports = new LogController();