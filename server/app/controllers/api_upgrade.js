/**
 * this is the http end point controller for accessing pobox upgrade
 *
 */
var async = require('async'),
    httpModule = require('../modules/http_module'),
    appConfig = require('../config/app_config'),
    upgradeModule = require('../modules/postbox/upgrade'),
    renewModule = require('../modules/postbox/renew'),
    entityBundle = require('../modules/entity/entity'),
    metaModule = require('../modules/entity/meta_module');

function UpgradeAPI() {

    var BASE_URI = 'api/upgrade';
    var upgradePoboxApiFn = {};

    this.handler = function (req, res, next) {
        var splitedUrlArray = req.path.split('/');
        var basePath = splitedUrlArray.splice(2, splitedUrlArray.length).join('/');
        switch (basePath) {
            case BASE_URI + '/getUpgradablePoBoxDetails':
                upgradePoboxApiFn.getUpgradablePoBoxDetails(req, res, next);
                break;
            case BASE_URI + '/upgradePoBox':
                upgradePoboxApiFn.upgradePoBox(req, res, next);
                break;
            default:
                response = {
                    description: 'Method not found(404)'
                };
                res.errorResponse(response);
                break;
        }
    };

    upgradePoboxApiFn.getUpgradablePoBoxDetails = function (req, res, next) {
        var box_number = req.query.box_number;
        var pobox_id = req.query.pobox_id;
        var emirate_id = req.query.emirate_id;
        var is_renewable = req.query.is_renwable;
        var lang = req.query.lang;
        async.parallel({
            deliveryOffices: function (callback) {
                upgradeModule.getDeliveryOffices(emirate_id, lang, function (deliveryOffices) {
                    callback(null, deliveryOffices);
                });
            },
            renewPriceList: function (callback) {
                if (is_renewable) {
                    renewModule.getRenewPriceList(pobox_id, lang, function (renewPriceList) {
                        callback(null, renewPriceList);
                    });
                } else {
                    callback(null, {});
                }
            },
            upgradablePoboxDetails: function (callback) {
                upgradeModule.getUpgradablePoboxDetails(box_number, emirate_id, lang, function (upgradablePoboxDetails) {
                    callback(null, upgradablePoboxDetails);
                });
            },
            languages: function (callback) {
                entityBundle.getLanguages(lang, metaModule.ENTITY_TYPE.LANGUAGE.code, function (languages) {
                    callback(null, languages);
                });
            },
            nationalities: function (callback) {
                entityBundle.getNationalities(lang, metaModule.ENTITY_TYPE.COUNTRY_CODE_ISOA3.code, function (nationalities) {
                    callback(null, nationalities);
                });
            },
        }, function (err, results) {
            if (!err) {
                httpModule.successResponse(res, {
                    data: results
                });
                return next();
            } else {
                httpModule.response(res, {
                    status: httpModule.STATUS.INTERNAL_SERVER_ERROR
                });
                return next();
            }
        });
    };

    upgradePoboxApiFn.upgradePoBox = function (req, res, next) {
        var requestData = req.body.formData;
        var lang = requestData.lang;
        var formData = {
            renew_upgrade_json: JSON.stringify(requestData),
        };

        var url = httpModule.formatUrl(appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.upgradePoBoxUrl, [requestData.upgrade_request.box.box_id]);
        httpModule.post(url, formData, function (response) {
            if (response && response.status === "SUCCESS") {
                httpModule.successResponse(res, {
                    description: 'Po box upgraded successfully',
                    data: response.data
                });
                return next();
            } else {
                var errorResponse = {
                    description: rentResponse.message
                    //description: 'Po box upgradation failed'
                };
                httpModule.errorResponse(res, errorResponse);
                return next();
            }
        });
    };

}

module.exports = new UpgradeAPI();