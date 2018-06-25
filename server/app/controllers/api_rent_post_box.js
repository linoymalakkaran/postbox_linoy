var httpModule = require('../modules/http_module'),
    appConfig = require('../config/app_config'),
    postboxModule = require('../modules/postbox/postbox'),
    entityBundle = require('../modules/entity/entity'),
    async = require('async'),
    reqValidator = require('../modules/validate.request.module'),
    extend = require('extend'),
    customerModule = require('../modules/customer/customer_module'),
    customerModel = require('../models/customer_model'),
    utils = require('../modules/utils'),
    metaModule = require('../modules/entity/meta_module'),
    customerApiController = require('../controllers/api_customer');


function RentPostBoxAPI() {

    var BASE_URI = 'api/rent';
    var RentboxAPIFn = {};

    this.handler = function (req, res, next) {
        var splitedUrlArray = req.path.split('/');
        var basePath = splitedUrlArray.splice(2, splitedUrlArray.length).join('/');
        switch (basePath) {
            case BASE_URI + '/rentBox':
                RentboxAPIFn.rent(req, res, next);
                break;
            case BASE_URI + '/rentBundleDetails':
                RentboxAPIFn.rentBundleDetails(req, res, next);
                break;
            case BASE_URI + '/rentDetails':
                RentboxAPIFn.rentDetails(req, res, next);
                break;
            case BASE_URI + '/pobox/hold':
                RentboxAPIFn.hold(req, res, next);
                break;
            case BASE_URI + '/pobox/unhold':
                RentboxAPIFn.unhold(req, res, next);
                break;
            case BASE_URI + '/pobox/free-box-areas/emirate':
                RentboxAPIFn.getFreeBoxAreasInEmirate(req, res, next);
                break;
            case BASE_URI + '/pobox/free-boxes/emirate':
                RentboxAPIFn.getBoxesInArea(req, res, next);
                break;
            default:
                response = {
                    description: 'Method not found(404)'
                };
                res.errorResponse(response);
                break;
        }
    };

    RentboxAPIFn.getFreeBoxAreasInEmirate = function (req, res, next) {

        var emirateId = req.query.emirate_id;
        var bundleId = req.query.bundle_id;
        var lang = req.query.lang;
        var boxLocationType = req.query.box_location_type;
        var url = httpModule.formatUrl(appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.areasInEmirateUrl, [bundleId, emirateId]);
        getFreeAreas(url, boxLocationType, lang, res, next);
    };

    RentboxAPIFn.getBoxesInArea = function (req, res, next) {
        var emirateId = req.query.emirate_id;
        var bundleId = req.query.bundle_id;
        var areaId = req.query.area_id;
        var url = httpModule.formatUrl(appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.boxInAreaUrl, [bundleId, emirateId, areaId]);
        getBoxesByArea(url, res, next);
    };

    RentboxAPIFn.unhold = function (req, res, next) {

        var poboxNumber = req.query.poboxNumber;
        var url = appConfig.api.postboxpos.baseUrl + httpModule.formatUrl(appConfig.api.postboxpos.unhold, [poboxNumber]);

        httpModule.post(url, null, function (response) {
            if (response && (response.status === 'SUCCESS')) {
                httpModule.successResponse(res, {
                    description: 'Success',
                    data: {
                        status: "OK"
                    }
                });
            } else {
                httpModule.successResponse(res, {
                    description: 'Error',
                    data: {
                        status: "Error"
                    }
                });
            }
            return next();
        });
    };

    RentboxAPIFn.hold = function (req, res, next) {

        var poboxNumber = req.query.poboxNumber;
        var url = appConfig.api.postboxpos.baseUrl + httpModule.formatUrl(appConfig.api.postboxpos.hold, [poboxNumber]);

        httpModule.post(url, null, function (response) {
            if (response && (response.status === 'SUCCESS')) {
                httpModule.successResponse(res, {
                    description: 'Success',
                    data: {
                        status: "OK"
                    }
                });
            } else {
                httpModule.successResponse(res, {
                    description: 'Error',
                    data: {
                        status: "Error"
                    }
                });
            }
            return next();
        });
    };

    RentboxAPIFn.rentDetails = function (req, res, next) {
        var accountPkid = reqValidator.getAccountPkId(req);
        var lang = req.query.lang;
        async.parallel({
            emirates: function (callback) {
                entityBundle.getEmirates(req.query.lang, metaModule.ENTITY_TYPE.EMIRATE.code, function (emirates) {
                    callback(null, emirates);
                });
            },
            languages: function (callback) {
                entityBundle.getLanguages(req.query.lang, metaModule.ENTITY_TYPE.LANGUAGE.code, function (languages) {
                    callback(null, languages);
                });
            },
            nationalities: function (callback) {
                entityBundle.getNationalities(req.query.lang, metaModule.ENTITY_TYPE.COUNTRY_CODE_ISOA3.code, function (nationalities) {
                    callback(null, nationalities);
                });
            },
            customerInfo: function (callback) {
                // smartpass and local account integration point
                if (accountPkid) {
                    customerApiController.getCustomerDetails(accountPkid, lang, function (customerDetails) {
                        callback(null, customerDetails);
                    });
                } else {
                    callback(null, {});
                }
            },
            customerSmartpassDetails: function (callback) {
                if (accountPkid) {
                    customerModule.customerProfileSmartPassDetails(accountPkid, function (customerSmartpassDetails) {
                        if (customerSmartpassDetails.status === "ERROR") {
                            callback(null, {});
                        } else {
                            callback(null, customerSmartpassDetails);
                        }
                    });
                } else {
                    callback(null, {});
                }
            }
        }, function (err, results) {
            if (!err) {
                results.pageData = {
                    isSmartPassLogin: results.customerInfo.isSmartPassLogin,
                    isLoggedIn: false
                };
                if (Object.keys(results.customerInfo).length !== 0) {
                    results.pageData.isLoggedIn = true;
                }
                results.customerDetails = results.customerInfo;
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

    RentboxAPIFn.rentBundleDetails = function (req, res, next) {
        var lang = req.query.lang;
        var contractType = req.query.contract_type;

        async.parallel({
            uiTranslationMessages: function (callback) {
                entityBundle.getUiTransalations(req.query.lang, metaModule.ENTITY_TYPE.LANGUAGETRANSLATIONFORRENTBOX.code, function (uiTranslationMessages) {
                    callback(null, uiTranslationMessages);
                });
            },
            productTranslationMessages: function (callback) {
                entityBundle.getProductTranslations(req.query.lang, metaModule.ENTITY_TYPE.PRODUCT.code, function (productTranslationMessages) {
                    callback(null, productTranslationMessages);
                });
            },
            bundles: async function () {
                let path = appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.bundleListUrl;
                let result = await httpModule.getAsync(path);
                if (result.status === 'SUCCESS') {
                    var bundleList = result.data.filter(c => c.rent_type === contractType);
                    return postboxModule.bundleMapping(lang, contractType, bundleList);
                } else {
                    return [];
                }
            }
        }, function (err, results) {
            if (!err) {
                results.uiTranslationMessages = extend(results.uiTranslationMessages, results.productTranslationMessages);
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

    RentboxAPIFn.rent = function (req, res, next) {

        var requestData = req.body.formData;

        async.parallel({
            usernameValidation: function (callback) {
                if (requestData.loginID) {
                    customerModule.checkUserNameAvailability(requestData.loginID, function (usernameAvailableResponse) {
                        callback(null, usernameAvailableResponse);
                    });
                } else {
                    requestData.accountPKID = requestData.accountPKID;
                    callback(null, true);
                }
            }
        }, function (err, results) {
            //all validations successful
            if (!err && results.usernameValidation) {
                var requestData = req.body.formData;
                var formData = {
                    rent_json: JSON.stringify(requestData),
                };
                var responseData = {};
                //rent api call
                var url = appConfig.api.postboxpos.baseUrl + httpModule.formatUrl(appConfig.api.postboxpos.rentUrl, [requestData.box.box_id]);
                httpModule.post(url, formData, function (rentResponse) {
                    if (rentResponse && rentResponse.status && rentResponse.status.toUpperCase() === "SUCCESS") {
                        customerModule.customerProfileDetails(rentResponse.data.account_id, function (customerDetails) {
                            var loginId = utils.findProp(customerDetails, "login_id");
                            var mobile = utils.findProp(customerDetails, "mobile");
                            var email = utils.findProp(customerDetails, "email");
                            loginId = Array.isArray(loginId) ? loginId[0] : loginId;
                            mobile = Array.isArray(mobile) ? mobile[0] : mobile;
                            email = Array.isArray(email) ? email[0] : email;

                            responseData = {
                                box_pkid: requestData.box_pkid,
                                account_pkid: rentResponse.data.account_id,
                                order_number: rentResponse.data.order_number,
                                customer_loginid: loginId
                            };
                            var orderPlacedMsg = requestData.box_pkid + 'Po Box rental order has been placed';
                            response = {
                                description: orderPlacedMsg + 'Account created successfully. Your credentials have been emailed to your email address.',
                                data: responseData
                            };
                            httpModule.successResponse(res, response);
                            try {
                                //send email
                                sendEmailResponseForRentPoBox(req, requestData, responseData);
                                req.log.debug({
                                    url: req.url,
                                    rentIdentifier: 'order_number:' + rentResponse.order_number,
                                    time: new Date(),
                                    data: requestData
                                }, 'RENT_REQUEST_SUCCESS');
                                req.log.debug({
                                    url: req.url,
                                    rentIdentifier: 'order_number:' + rentResponse.order_number,
                                    time: new Date(),
                                    data: responseData
                                }, 'RENT_RESPONSE_SUCCESS');
                            } catch (ex) { }
                            //postboxModule.saveSurveyResult(requestData, mobile, email);
                            return next();
                        });
                    } else {
                        req.log.error({
                            url: req.url,
                            time: new Date(),
                            data: {
                                rentRequestData: requestData
                            },
                        }, 'RENT_REQUEST_ERROR');
                        if (rentResponse.status === "ERROR" && rentResponse.message === "RESERVED_BOX") {
                            httpModule.errorResponse(res, {
                                description: 'Reserved Box'
                            });
                            req.log.error({
                                url: req.url,
                                time: new Date(),
                                data: {
                                    rentResponse: rentResponse,
                                    description: 'Reserved Box'
                                },
                            }, 'RENT_RESPONSE_ERROR');
                        } else {
                            httpModule.errorResponse(res, {
                                description: rentResponse.message == undefined ? "Error while processing the RENT request." : rentResponse.message
                                //description: 'There has been an error in communicating. Please try after sometime.'
                            });
                            req.log.error({
                                url: req.url,
                                time: new Date(),
                                data: {
                                    rentResponse: rentResponse,
                                    description: 'API return error'
                                },
                            }, 'RENT_RESPONSE_ERROR');
                        }
                        return next();
                    }
                });

            } else {
                if (results.passport_document && results.passport_document.errno === -4058) {
                    httpModule.response(res, {
                        status: httpModule.STATUS.INTERNAL_SERVER_ERROR,
                        description: 'GENERAL.FILE_NOT_FOUND',
                        data: {
                            type: 'MISSING PASSPORT DOCUMENT',
                            fileName: results.passport_document.fileName
                        }
                    });
                } else if (!results.usernameValidation) {
                    httpModule.errorResponse(res, {
                        description: 'Username is not available'
                    });
                } else {
                    httpModule.errorResponse(res, {
                        description: 'POBOX.ERR_MSG_FILE_UPLOAD'
                    });
                }
                return next();
            }
        });
    };

    function getFreeAreas(url, boxLocationType, lang, res, next) {
        httpModule.get(url, function (areasResponse) {
            if (areasResponse.status === "SUCCESS" && Array.isArray(areasResponse.data)) {
                var metaEntity = (boxLocationType == "HOME") ? metaModule.ENTITY_TYPE.COMMUNITY : metaModule.ENTITY_TYPE.OFFICE;
                metaModule.getMetaByEntity(metaEntity, lang, function (areaList) {
                    var array = [];
                    if (areaList) {
                        array = areasResponse.data.map(function (item) {
                            return {
                                id: item.area_id,
                                name: postboxModule.getAreaName(areaList, item)
                            };
                        });
                        array.sort(function (a, b) {
                            if (a.name < b.name)
                                return -1;
                            if (a.name > b.name)
                                return 1;
                            return 0;
                        });
                    }
                    if (array.length === 0) {
                        httpModule.warningResponse(res, {
                            description: 'No area available'
                        });
                    } else {
                        httpModule.successResponse(res, {
                            data: {
                                "areas": array
                            }
                        });
                    }
                    return next();
                });
            } else {
                httpModule.warningResponse(res, {
                    description: 'No area available'
                });
                return next();
            }
        });
    }
}

function getBoxesByArea(url, res, next) {
    httpModule.get(url, function (boxesResponse) {
        if (boxesResponse.status === "SUCCESS" && Array.isArray(boxesResponse.data)) {
            var array = [];
            if (boxesResponse.data) {
                array = boxesResponse.data.map(function (item) {
                    return {
                        id: item.box_id,
                        name: item.box_number,
                        box_number: item.box_number,
                        unique_box_number: item.box_id,
                        area_type: item.area_type,
                        area_id: item.area_id,
                        emirate_id: item.emirate_id
                    };
                });
            }
            if (array.length === 0)
                httpModule.warningResponse(res, {
                    description: 'No box available'
                });
            else {
                httpModule.successResponse(res, {
                    data: {
                        "boxes": array
                    }
                });
            }
        } else {
            httpModule.warningResponse(res, {
                description: 'No box available'
            });
        }
        return next();
    });
}

module.exports = new RentPostBoxAPI();