var httpModule = require('../modules/http_module');
var appConfig = require('../config/app_config');
var cacheModule = require('../modules/cache_module');

exports.infraAuthorize = function (callback) {
    var cachedToken = cacheModule.getCacheKeyValue('fileOAuthtoken');
    if (cachedToken.data) {
        callback(cachedToken.data.token);
    } else {
        var formData = { grant_type: 'client_credentials' };
        var auth = 'Basic ' + new Buffer(appConfig.authentication.infra.username + ':' + appConfig.authentication.infra.password).toString('base64');
        var path = appConfig.api.infra.baseUrl + appConfig.api.infra.oAuthUrl;
        var options = { headers: { "Authorization": auth } };

        httpModule.post(path, formData, function (response) {
            if (response) {
                var tokenObj = {
                    token: response.access_token
                };
                //cacheModule.setCache('fileOAuthtoken', tokenObj, 35999);
                cacheModule.setCache('fileOAuthtoken', tokenObj, 10000);
                callback(response.access_token);
            } else {
                callback(null);
            }
        }, options);
    }
};