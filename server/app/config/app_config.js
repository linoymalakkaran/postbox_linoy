var isProduction = process.env.NODE_ENV !== "development";
var apiConfig = require('../config/api_config');
var routeConfig = require('../config/route_config');
var path = require('path');
var extend = require('extend');

var defaultAppConfig = {
    port: 6084,
    context_root: "/mypostbox",
    mypobox_url: "http://intranet/staging_esvc/services/postbox/mybox/decorated.xhtml",
    payment_handler_url: "http://intranet/staging/mypostbox/paymenthandler",
    payment_form_url: "http://intranet/test/svc_pgwy/pg_requesthndlr",
    versionSupported: ['1.0'],
    authentication: {
        app: {},
        user: {},
        infra: {
            username: 'mobile-api-server',
            password: 'mapi'
        }
    },
    api: apiConfig,
    route: routeConfig,
    database: {
        connectionString: 'localhost:7377/rentPoBox',
        collection: 'rentBoxApi'
    },
    i18n: {
        translationsPath: path.join(__dirname, 'i18n'), // <--- use here. Specify translations files path.
        siteLangs: ["en", "ar", "ur"],
        textsVarName: 'translation'
    },
    infra: {
        baseUrl: 'http://intranet/api_infra/',
        oAuthUrl: 'oauth/token',
        temporaryfileUploadUrl: 'filedb/t0/store',
        temporaryfileViewUrl: 'filedb/t0/view?fileid_s={0}'
    },
    log: {
        logBasePath: "",
        debugPath: "../../log/debug/debug.log",
        debugBasePath: "../../log/debug/",
        tracePath: "../../log/trace/trace.log",
        errorBasePath: "../../log/error/",
        errorPath: "../../log/error/error.log",
        infoPath: "../../log/info/info.log"
    },
    filePath: '',
    poboxjwt: {
        token: 'epg-mypostbox',
        secret: 'epgmypostbox-secret'
    }
};

if (isProduction) {
    var prodAppConfig = require('../config/production/app-config');
    extend(true, defaultAppConfig, prodAppConfig);
} else {
    var devAppConfig = require('../config/development/app-config');
    extend(true, defaultAppConfig, devAppConfig);
}

module.exports = defaultAppConfig;