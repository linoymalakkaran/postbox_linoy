var isProduction = process.env.NODE_ENV !== "development";
var fs = require('fs');
var path = require('path');
var extend = require('extend');
var apiVersion = '1.0.0';

var defaultRouteConfigure = {

    init: function (server, urlPrefix) {

        var controllers = {},
            controllers_path = path.join(__dirname, "../controllers");
        fs.readdirSync(controllers_path).forEach(function (file) {
            if (file.indexOf('.js') != -1) {
                controllers[file.split('.')[0]] = require(controllers_path + '/' + file);
            }
        });

        server.get(urlPrefix + '/api/customer/*', controllers.api_customer.handler);

        server.get(urlPrefix + '/api/mypobox/*', controllers.api_my_post_box.handler);
        server.post(urlPrefix + '/api/mypobox/*', controllers.api_my_post_box.handler);

        server.get(urlPrefix + '/api/upgrade/*', controllers.api_upgrade.handler);
        server.post(urlPrefix + '/api/upgrade/*', controllers.api_upgrade.handler);

        server.get(urlPrefix + '/api/postbox/*', controllers.api_post_box.handler);
        server.post(urlPrefix + '/api/postbox/*', controllers.api_post_box.handler);

        server.get(urlPrefix + '/api/renew/*', controllers.api_renew_post_box.handler);
        server.post(urlPrefix + '/api/renew/*', controllers.api_renew_post_box.handler);

        server.get(urlPrefix + '/api/rent/*', controllers.api_rent_post_box.handler);
        server.post(urlPrefix + '/api/rent/*', controllers.api_rent_post_box.handler);

        //get detailed logs
        server.get(urlPrefix + '/log/debug', controllers.api_log.getDebugLog);
        server.get(urlPrefix + '/log/error', controllers.api_log.getErrorLog);
        server.post(urlPrefix + '/log/debug', controllers.api_log.getDebugLog);
    }
};

if (isProduction) {
    var prodRouteConfig = require('../config/production/route-config');
    extend(true, defaultRouteConfigure, prodRouteConfig);
} else {
    var devRouteConfig = require('../config/development/route-config');
    extend(true, defaultRouteConfigure, devRouteConfig);
}

module.exports = defaultRouteConfigure;