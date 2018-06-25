/**
 * This file is used for calling post box upgrade service API's
 */
var httpModule = require('../http_module');
var appConfig = require('../../config/app_config');
var metaModule = require('../../models/entity_models');
var postboxModule = require('../../modules/postbox/postbox');
var entityModule = require('../../modules/entity/meta_module');


exports.getRentPriceList = function (pobox_id, lang, callBack) {
    var url = httpModule.formatUrl(appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.duesUrl, [pobox_id, 1]);
    var result = {
        additionalServices: [],
        mandatoryServices: []
    };
    httpModule.get(url, function (duesListResponse) {
        if (duesListResponse && duesListResponse.status === "ERROR") {
            return callBack(result);
        }
        if (!duesListResponse) {
            return callBack(result);
        }
        postboxModule.ProductPriceMapping(lang, duesListResponse, result, callBack);
    });
};