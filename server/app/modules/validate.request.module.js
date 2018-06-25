var jwt = require('jsonwebtoken');
var appConfig = require('../config/app_config');
var _log = require('./log-module');

var COOKIE_KEY = 'mypostbox-cookie';
var TOKEN_KEY = 'mypostbox-token';

exports.setPOBoxToken = function (res, accountPkId, lang) {
    var payload = {
        TOKEN_KEY: appConfig['poboxjwt'].token
    };
    if (accountPkId) {
        payload.ACCOUNT_ID = accountPkId;
    }

    payload.lang = lang != undefined ? lang : 'en';

    var _token = jwt.sign(payload,
        appConfig['poboxjwt'].secret);
    res.cookie(COOKIE_KEY, _token, {
        httpOnly: true
    });
}

exports.isReqAuthorized = function (req) {
    var result = false;
    var _token = req.cookies['mypostbox-cookie'];
    if (_token) {
        var decoded = jwt.verify(_token, appConfig['poboxjwt'].secret);
        if (decoded.TOKEN_KEY === appConfig['poboxjwt'].token) {
            var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            _log.logSecurity({
                message: 'User with account_id: ' + decoded.ACCOUNT_ID + ' performed request.',
                requesturl: fullUrl
            });
            result = true;
        }
    }
    return result;
}

exports.validateRequest = function (req, res, next) {
    var valid_methods = ['GET', 'POST', 'PUT', 'DELETE'];
    if (valid_methods.indexOf(req.method) !== -1) {
        var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        // escape localhost
        var _patterns = ['localhost'];
        var isAllowed = _patterns.reduce(function (previousValue, currentValue) {
            var isPresent = (fullUrl.indexOf(currentValue) !== -1);
            return (previousValue || isPresent);
        }, false);
        if (!isAllowed) {
            if (exports.isReqAuthorized(req)) {
                next();
            } else {
                res.status(403).send('Unauthorized: ' + new Date());
            }
        } else {
            next();
        }
    } else {
        next();
    }
}

exports.getAccountPkId = function (req) {
    var accountPkId = '';
    var _token = req.cookies['mypostbox-cookie'];
    if (_token) {
        var decoded = jwt.verify(_token, appConfig['poboxjwt'].secret);
        if (decoded.ACCOUNT_ID) {
            accountPkId = decoded.ACCOUNT_ID;
        }
    }
    return accountPkId;
}

exports.getLang = function (req) {
    var lang = 'en';
    var _token = req.cookies['mypostbox-cookie'];
    if (_token) {
        var decoded = jwt.verify(_token, appConfig['poboxjwt'].secret);
        if (decoded.lang) {
            accountPkId = decoded.lang;
        }
    }
    return lang;
}