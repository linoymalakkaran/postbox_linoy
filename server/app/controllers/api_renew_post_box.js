var httpModule = require('../modules/http_module'),
    appConfig = require('../config/app_config'),
    utils = require('../modules/utils'),
    postboxModule = require('../modules/postbox/postbox'),
    renewModule = require('../modules/postbox/renew'),
    entityBundle = require('../modules/entity/entity'),
    entityModel = require('../modules/entity/meta_module'),
    async = require('async'),
    reqValidator = require('../modules/validate.request.module'),
    customerModule = require('../modules/customer/customer_module');

function RenewPostBoxAPI() {

    var BASE_URI = 'api/renew';
    var RenewPostBoxAPIFn = {};

    this.handler = function (req, res, next) {
        var splitedUrlArray = req.path.split('/');
        var basePath = splitedUrlArray.splice(2, splitedUrlArray.length).join('/');
        switch (basePath) {
            case BASE_URI + '/renewbox':
                RenewPostBoxAPIFn.renew(req, res, next);
                break;
            case BASE_URI + '/boxDetails':
                RenewPostBoxAPIFn.boxDetails(req, res, next);
                break;
            case BASE_URI + '/boxProductPrice':
                RenewPostBoxAPIFn.boxProductPrice(req, res, next);
                break;
            default:
                response = {
                    description: 'Method not found(404)'
                };
                res.errorResponse(response);
                break;
        }
    };

    RenewPostBoxAPIFn.boxDetails = function (req, res, next) {
        var box_number = req.query.box_number;
        var pobox_id = req.query.pobox_id;
        var emirate_id = req.query.emirate_id;
        var lang = req.query.lang;
        async.parallel({
            nationalities: function (callback) {
                entityBundle.getNationalities(lang, entityModel.ENTITY_TYPE.COUNTRY_CODE_ISOA3.code, function (nationalities) {
                    callback(null, nationalities);
                });
            },
            renewPriceList: function (callback) {
                postboxModule.getDuePriceList(pobox_id, lang, function (renewPriceList) {
                    callback(null, renewPriceList);
                });
            }
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

    RenewPostBoxAPIFn.renew = function (req, res, next) {

        var requestData = req.body.formData;
        var formData = {
            renew_json: JSON.stringify(requestData),
        };
        var url = appConfig.api.postboxpos.baseUrl + httpModule.formatUrl(appConfig.api.postboxpos.renewUrl, [requestData.box.box_id]);
        httpModule.post(url, formData, function (response) {
            if (response && response.status && response.status.toUpperCase() === "SUCCESS") {
                var data = null;
                var accountPkId = reqValidator.getAccountPkId(req);
                customerModule.customerProfileDetails(accountPkId, function (customerDetails) {
                    var loginId = utils.findProp(customerDetails, "login_id");
                    var mobile = utils.findProp(customerDetails, "mobile");
                    var email = utils.findProp(customerDetails, "email");
                    loginId = Array.isArray(loginId) ? loginId[0] : loginId;
                    mobile = Array.isArray(mobile) ? mobile[0] : mobile;
                    email = Array.isArray(email) ? email[0] : email;

                    data = {
                        box_pkid: requestData.box.box_id,
                        order_pkid: response.orderPKID,
                        account_pkid: response.data.account_id,
                        order_number: response.data.order_number,
                        customer_loginid: loginId
                    };
                    httpModule.successResponse(res, {
                        description: 'Renewed successfully',
                        data: data
                    });
                    //postboxModule.saveSurveyResult(requestData, mobile, email);
                    return next();
                });

                utils.customLogging(req, {
                    url: req.url,
                    renewIdentifier: 'orderId:' + response.orderPKID,
                    time: new Date(),
                    data: requestData
                }, 'RENEW_REQUEST_SUCCESS', 'debug');

                utils.customLogging(req, {
                    url: req.url,
                    renewIdentifier: 'orderId:' + response.orderPKID,
                    time: new Date(),
                    data: response.data
                }, 'RENEW_RESPONSE_SUCCESS', 'debug');

            } else {
                var errorResponse = {
                    description: response.message == undefined ? "Error while processing the RENT request." : response.message
                    //description: 'Renewal Failed. Please try again.'
                };
                httpModule.errorResponse(res, errorResponse);

                utils.customLogging(req, {
                    url: req.url,
                    time: new Date(),
                    data: requestData
                }, 'RENEW_REQUEST_FAILED', 'debug');

                utils.customLogging(req, {
                    url: req.url,
                    time: new Date(),
                    data: response
                }, 'RENEW_RESPONSE_FAILED', 'debug');
                return next();
            }
        });
    };

}

module.exports = new RenewPostBoxAPI();