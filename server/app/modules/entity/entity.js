/**
 * This file is used for getting entity key value data service API's
 * eg: country, nationality, emirate...etc
 */
var httpModule = require('../http_module');
var appConfig = require('../../config/app_config');

/**
 * To retrieve list of emirates
 */
exports.getEmirates = function (language, code, callback) {

    //var url = appConfig.api.mock.baseUrl + appConfig.api.mock.entityUrl;
    var url = httpModule.formatUrl(appConfig.api.translation.baseUrl + appConfig.api.translation.entityUrl, [
        language,
        code
    ]);

    httpModule.get(url, function (response) {
        var array = [];
        if (response) {
            array = response.map(function (item) {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            array.sort(function (a, b) {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
        }
        return callback(array);
    });
};

/**
 * To retrieve list of languages
 */
exports.getLanguages = function (language, code, callback) {

    var locales = require('../../locales/' + language + '.json');
    callback(locales.LANGUAGES);
};

/**
 * To retrieve list of nationalities
 */
exports.getNationalities = function (language, code, callback) {

    var url = httpModule.formatUrl(appConfig.api.translation.baseUrl + appConfig.api.translation.entityUrl, [
        language,
        code
    ]);

    httpModule.get(url, function (response) {
        var array = [];
        if (response) {
            array = response.map(function (item) {
                return {
                    id: item.id,
                    name: item.name,
                };
            });
            array.sort(function (a, b) {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
        }
        return callback(array);
    });
};

/**
 * To retrieve ui translation messages
 */
exports.getUiTransalations = function (language, code, callback) {

    var url = httpModule.formatUrl(appConfig.api.translation.baseUrl + appConfig.api.translation.uiTranslationsUrl, [
        language,
        code
    ]);

    httpModule.get(url, function (response) {
        return callback(response);
    });
};

exports.getProductTranslations = function (language, code, callback) {

    var url = httpModule.formatUrl(appConfig.api.translation.baseUrl + appConfig.api.translation.entityUrl, [
        language,
        code
    ]);

    httpModule.get(url, function (response) {
        var data = {};
        response.map(function (obj) {
            var id = obj.id;
            data[id] = obj.name;
        });
        return callback(data);
    });
};