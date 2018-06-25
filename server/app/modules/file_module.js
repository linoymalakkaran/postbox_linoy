var httpModule = require('../modules/http_module');
var authModule = require('../modules/auth_module');
var appConfig = require('../config/app_config');

exports.upload = function (fileName, fileStream, callback) {
    authModule.infraAuthorize(function (authorizationToken) {
        if (!authorizationToken) {
            return callback(null);
        }
        else {
            var path = appConfig.api.infra.baseUrl + appConfig.api.infra.temporaryfileUploadUrl;
            var formData = [{ key: 'fileid_s', value: fileName }];
            var options = { headers: { "Authorization": 'Bearer ' + authorizationToken, } };

            httpModule.postFile(path, 'file_f', fileStream, formData, function (response) {
                if (response.statusCode === 200) {
                    callback(response);
                } else {
                    callback(null);
                }
            }, options);
        }
    });
};

exports.view = function (fileName, callback) {
    authModule.infraAuthorize(function (authorizationToken) {
        if (!authorizationToken) {
            return callback(null);
        }
        else {
            var options = {
                headers: {
                    'Authorization': 'Bearer ' + authorizationToken
                }
            };
            var path = appConfig.api.infra.baseUrl + appConfig.api.infra.temporaryfileViewUrl;
            var url = httpModule.formatUrl(path, [fileName]);
            try {
                httpModule.get(url, function (response) {
                    if (response) {
                        var buff = new Buffer(response);
                        callback(buff);
                    } else {
                        callback(null);
                    }
                }, options);
            } catch (ex) {
                callback(null);
            }
        }
    });
};