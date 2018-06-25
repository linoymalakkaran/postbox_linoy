/**
 * this is the http end point controller for accessing pobox general postbox services
 *
 */
let httpModule = require('../modules/http_module'),
    appConfig = require('../config/app_config'),
    reqValidator = require('../modules/validate.request.module'),
    _log = require('../modules/log-module'),
    postboxModule = require('../modules/postbox/postbox'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

function PostBoxAPI() {

    let BASE_URI = 'api/postbox';
    let poboxApiFn = {};

    this.handler = function (req, res, next) {
        let splitedUrlArray = req.path.split('/');
        let basePath = splitedUrlArray.splice(2, splitedUrlArray.length).join('/');
        switch (basePath) {
            case BASE_URI + '/ui-config':
                poboxApiFn.uiConfig(req, res, next);
                break;
            case BASE_URI + '/product/price-details':
                poboxApiFn.getProductPrice(req, res, next);
                break;
            case BASE_URI + '/bundle/price-details':
                poboxApiFn.getBundlePriceDetails(req, res, next);
                break;
            case BASE_URI + '/uploadFile':
                poboxApiFn.uploadFile(req, res, next);
                break;
            case BASE_URI + '/viewFile':
                poboxApiFn.viewFile(req, res, next);
                break;
            case BASE_URI + '/deleteFile':
                poboxApiFn.deleteFile(req, res, next);
                break;
            default:
                response = {
                    description: 'Method not found(404)'
                };
                res.errorResponse(response);
                break;
        }
    };

    poboxApiFn.uiConfig = function (req, res, next) {
        httpModule.successResponse(res, {
            data: {
                payment_handler_url: appConfig.payment_handler_url,
                payment_form_url: appConfig.payment_form_url
            }
        });
        return next();
    };

    poboxApiFn.getProductPrice = function (req, res, next) {
        var productCode = req.query.product_code;
        var duration = req.query.duration;
        var quantity = req.query.quantity;
        var contractType = req.query.contract_type;
        var bundleCode = req.query.bundle_code;
        var orderType = req.query.order_type; // NEW or RENEW
        var url = httpModule.formatUrl(appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.productRentalPriceUrl,
            [bundleCode, productCode, contractType, orderType, new Date().getFullYear(), quantity]);
        httpModule.get(url, function (response) {
            if (response && response.status.toUpperCase() == "SUCCESS") {
                var result = response.data;
                httpModule.successResponse(res, {
                    data: {
                        price: result.amount,
                        price_unit: "AED",
                        vat: result.is_taxable ? parseFloat(result.taxes[0].amount) : 0,
                        vatpercent: result.is_taxable ? result.taxes[0].percentage : 0
                    }
                });
                return next();
            } else {
                var errorResponse = {
                    description: 'NO_DATA _FOUND'
                };
                httpModule.errorResponse(res, errorResponse);
                return next();
            }
        });
    };

    poboxApiFn.getBundlePriceDetails = function (req, res, next) {
        var box_id = req.query.box_id;
        var lang = req.query.lang;
        var url = httpModule.formatUrl(appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.boxInfo, [box_id]);
        httpModule.get(url, function (response) {
            var result = {
                additionalServices: [],
                mandatoryServices: []
            };
            if (response && response.status === "ERROR") {
                httpModule.errorResponse(res, result);
                next();
            } else {
                var priceDetails = response.data.service_details;
                postboxModule.ProductPriceMapping(lang, priceDetails, result, function () {
                    httpModule.successResponse(res, {
                        data: result
                    });
                    next();
                });
            }
        });
    };

    poboxApiFn.viewFile = function (req, res, next) {
        var filePath = req.query.filePath;
        var serverTempFilePath = path.join(__dirname + '/../../documents/') + filePath;
        res.sendFile(serverTempFilePath);
    };

    poboxApiFn.deleteFile = function (req, res, next) {
        var filePath = req.query.filePath;
        var serverTempFilePath = path.join(__dirname + '/../../documents/') + filePath;
        fs.unlink(serverTempFilePath, (err) => {
            if (err) {
                httpModule.errorResponse(res, {
                    status: "ERROR",
                    description: 'File delete failed'
                });
            } else {
                httpModule.successResponse(res, {
                    description: 'Success',
                    data: {
                        status: "OK"
                    }
                });
            }
            return next();
        });
    };

    poboxApiFn.uploadFile = function (req, res, next) {

        var orginalFileName = req.files.file.name;
        var extension = path.extname(req.files.file.name);
        fileName = req.body.emitrate + '_' + req.body.docName + extension;
        var serverTempFilePath = path.join(__dirname + '/../../documents/' + req.body.docType.toUpperCase() + '/' + req.body.uploadedDateTime.replace(new RegExp('/', 'g'), '_') + '/' + req.body.poboxNo);
        mkdirp(serverTempFilePath, function (err) {
            if (err) { console.error(err); }
            else {
                let fullFilePath = serverTempFilePath + '/' + fileName;
                req.files.file.mv(fullFilePath, function (err) {
                    if (err) {
                        httpModule.errorResponse(res, {
                            status: "ERROR",
                            description: 'File Upload failed'
                        });
                        return next();
                    }

                    //var stream = fs.createReadStream(serverTempFilePath);
                    //fs.unlink(serverTempFilePath, (err) => { });
                    httpModule.successResponse(res, {
                        description: 'Success',
                        data: {
                            status: "OK",
                            file_identifier: fileName
                        }
                    });
                    return next();
                });
            }
        });
    };

}

module.exports = new PostBoxAPI();