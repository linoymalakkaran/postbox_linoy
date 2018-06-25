/**
 * this is the http end point controller for accessing customer info
 *
 */
var extend = require('extend'),
    async = require('async'),
    fs = require('fs-extra'), //File System - for file manipulation
    path = require('path'),
    httpModule = require('../modules/http_module'),
    customerModule = require('../modules/customer/customer_module'),
    appConfig = require('../config/app_config'),
    entityBundle = require('../modules/entity/entity'),
    entityModel = require('../models/entity_models'),
    cacheModule = require('../modules/cache_module'),
    fileModule = require('../modules/file_module'),
    poboxModule = require('../modules/postbox/postbox'),
    metaModule = require('../modules/entity/meta_module'),
    reqValidator = require('../modules/validate.request.module'),
    _log = require('../modules/log-module');

function MYPostBoxAPI() {

    var BASE_URI = 'api/mypobox';
    var myPoboxApiFn = {};

    this.handler = function (req, res, next) {
        var splitedUrlArray = req.path.split('/');
        var basePath = splitedUrlArray.splice(2, splitedUrlArray.length).join('/');
        switch (basePath) {
            case BASE_URI + '/applicationformdata':
                myPoboxApiFn.getApplicationFormData(req, res, next);
                break;
            case BASE_URI + '/getContractsByAccountId':
                myPoboxApiFn.getContractsByAccountId(req, res, next);
                break;
            case BASE_URI + '/getPayments':
                myPoboxApiFn.getPayments(req, res, next);
                break;
            case BASE_URI + '/getPaymentDetails':
                myPoboxApiFn.getPaymentDetails(req, res, next);
                break;
            case BASE_URI + '/getReceiptDetails':
                myPoboxApiFn.getReceiptDetails(req, res, next);
                break;
            case BASE_URI + '/getOrders':
                myPoboxApiFn.getOrders(req, res, next);
                break;
            case BASE_URI + '/getOrderDetails':
                myPoboxApiFn.getOrderDetails(req, res, next);
                break;
            case BASE_URI + '/getCustomerDetails':
                myPoboxApiFn.getCustomerDetails(req, res, next);
                break;
            case BASE_URI + '/cancelOrder':
                myPoboxApiFn.cancelOrder(req, res, next);
                break;
            case BASE_URI + '/prepare3DSPayment':
                myPoboxApiFn.prepare3DSPayment(req, res, next);
                break;
            case BASE_URI + '/result3DSPayment':
                myPoboxApiFn.result3DSPayment(req, res, next);
                break;
            default:
                response = {
                    description: 'Method not found(404)'
                };
                res.errorResponse(response);
                break;
        }
    };

    this.validateToken = function (token, callback) {
        var url = appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.validateTokenUrl;
        var formData = {
            token: token
        };
        httpModule.post(url, formData, function (result) {
            if (result && result.status == 'SUCCESS') {
                var data = {
                    isValid: result.data.isValid,
                    paymentid: result.data.paymentid,
                    accountid: result.data.accountid,
                    lang: result.data.lang
                };
                callback(data);
            } else {
                callback(null);
            }
        });
    };

    this.sendPaymentNotification = function (txn_ref, account_id, lang) {
        var url = appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.sendPaymentNotificationUrl;
        var formData = {
            txn_ref: txn_ref,
            account_id: account_id,
            lang: lang
        };

        httpModule.post(url, formData, function (result) {
            if (result && result.status == 'SUCCESS' && result.data) {
                var logData = 'Notification send successfully: txn_ref: ' + txn_ref;
                _log.logPayment(logData);
            } else {
                var logData = 'Notification send failed: txn_ref: ' + txn_ref;
                _log.logPayment(logData);
            }
        });
    }

    myPoboxApiFn.cancelOrder = function (req, res, next) {
        var order_id = req.query.order_id;
        var url = httpModule.formatUrl(appConfig.api.pobox.baseUrl + appConfig.api.pobox.cancelOrder, [order_id]);
        httpModule.post(url, '', function (result) {
            if (result) {
                httpModule.successResponse(res, {
                    description: 'ORDER.CANCELLED',
                    data: result
                });
                return next();
                // myPoboxApiFn.getOrderDetailByOrderId(order_id, req.locale, function (err, orderDetail) {
                //     if (orderDetail) {
                //         httpModule.successResponse(res, {
                //             description: 'ORDER.CANCELLED',
                //             data: result
                //         });
                //     } else if (err) {
                //         var errorResponse = {
                //             description: 'NO_ORDER_CANCELLED'
                //         };
                //         httpModule.errorResponse(res, errorResponse);
                //     }
                //     return next();
                // });
            } else {
                var errorResponse = {
                    description: 'NO_ORDER_CANCELLED'
                };
                httpModule.errorResponse(res, errorResponse);
                return next();
            }
        });
    };

    myPoboxApiFn.getCustomerDetails = function (req, res, next) {
        var accountPkId = reqValidator.getAccountPkId(req); //req.query.accountPkId;
        customerModule.customerProfileDetails(accountPkId, function (customerDetails) {
            if (customerDetails) {
                httpModule.successResponse(res, {
                    description: 'POBOX.CUSTOMER_DETAILS',
                    data: customerDetails
                });
            } else {
                var errorResponse = {
                    description: 'NO_CUSTOMER_DETAILS _FOUND'
                };
                httpModule.errorResponse(res, errorResponse);
            }
            return next();
        });
    };

    myPoboxApiFn.getReceiptDetails = function (req, res, next) {
        var accountPkId = reqValidator.getAccountPkId(req); //req.query.accountPkId;
        var paymentId = req.query.payment_pkid;
        //var locale = reqValidator.getLang(req);

        myPoboxApiFn.getOrdersByAccountId(accountPkId, function (err, orders) {
            if (orders) {
                httpModule.successResponse(res, {
                    data: orders
                });
                next();
            } else if (err) {
                httpModule.response(res, {
                    status: httpModule.STATUS.INTERNAL_SERVER_ERROR
                });
                next();
            }
        });
    };

    myPoboxApiFn.getApplicationFormData = function (req, res, next) {

        async.parallel({
            uiTranslationMessages: function (callback) {
                entityBundle.getUiTransalations(req.query.lang, entityModel.ENTITY_TYPE.LANGUAGETRANSLATIONFORRENTBOX.code, function (uiTranslationMessages) {
                    callback(null, uiTranslationMessages);
                });
            },
            productTranslationMessages: function (callback) {
                entityBundle.getProductTranslations(req.query.lang, entityModel.ENTITY_TYPE.PRODUCT.code, function (productTranslationMessages) {
                    callback(null, productTranslationMessages);
                });
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

    myPoboxApiFn.getContractsByAccountId = function (req, res, next) {
        var accountPkId = reqValidator.getAccountPkId(req);
        var lang = req.query.lang;
        poboxModule.getContractsByAccountId(accountPkId, function (contracts) {
            if (contracts) {
                httpModule.successResponse(res, {
                    description: 'SUCCESS',
                    data: contracts
                });
            } else {
                var errorResponse = {
                    description: 'NO CONTRACT DETAILS FOUND'
                };
                httpModule.errorResponse(res, errorResponse);
            }
        });
    };

    myPoboxApiFn.getPayments = function (req, res, next) {
        var accountPkId = reqValidator.getAccountPkId(req); //req.query.accountPkId;
        var url = httpModule.formatUrl(appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.paymentsUrl, [accountPkId]);
        httpModule.get(url, function (response) {
            if (response && response.status == 'SUCCESS' && response.data) {
                httpModule.successResponse(res, {
                    data: { payments: response.data }
                });
            } else {
                httpModule.warningResponse(res, {
                    description: 'GENERAL.MSG_NO_DATA'
                });
            }
            return next();
        });
    };

    myPoboxApiFn.getPaymentDetails = function (req, res, next) {
        var paymentId = req.query.payment_pkid;
        var accountPkId = reqValidator.getAccountPkId(req);
        poboxModule.getPaymentDetailsByPaymentId(paymentId, accountPkId).then((response) => {
            if (response != null) {
                httpModule.successResponse(res, {
                    data: response.payments
                });
            } else {
                httpModule.errorResponse(res, {
                    description: 'No payment found'
                });
            }
            return next();
        });
    };

    myPoboxApiFn.getOrders = function (req, res, next) {
        var accountPkId = reqValidator.getAccountPkId(req);
        myPoboxApiFn.getOrdersByAccountId(accountPkId, function (error, orders) {
            if (orders) {
                for (var i in orders) {
                    orders[i].remarks = 'POBOX.ORDERSTATUS.' + orders[i].order_status;
                }
                var filteredOrders = orders.filter(c => c.remarks != 'CANCELLED').reverse();
                httpModule.successResponse(res, {
                    data: { orders: filteredOrders }
                });
            } else if (error) {
                httpModule.warningResponse(res, {
                    description: 'GENERAL.MSG_NO_DATA'
                }); // IF REMARK IS CANCELLED DO NOT SHOW 04th Sep 2016
            }
            return next();
        });
    };

    myPoboxApiFn.getOrdersByAccountId = function (accountPkId, callback) {
        var url = httpModule.formatUrl(appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.ordersUrl, [accountPkId]);
        httpModule.get(url, function (response) {
            if (response.status == 'SUCCESS' && response.data) {
                return callback(null, response.data);
            } else {
                return callback({
                    message: 'No orders found.'
                }, null);
            }
        });
    };

    myPoboxApiFn.getOrderDetails = function (req, res, next) {
        let orderId = req.query.order_id;
        let lang = reqValidator.getLang(req);
        myPoboxApiFn.getOrderDetailByOrderId(orderId, lang, function (err, orderDetail) {
            if (orderDetail) {
                httpModule.successResponse(res, {
                    data: { order: orderDetail }
                });
            } else if (err) {
                httpModule.response(res, {
                    status: httpModule.STATUS.INTERNAL_SERVER_ERROR
                });
            }
            return next();
        });
    };

    myPoboxApiFn.getOrderDetailByOrderId = function (orderId, locale, cb) {
        var orderUrl = httpModule.formatUrl(appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.orderDetailsUrl, [orderId]);
        httpModule.get(orderUrl, function (response) {
            if (response && response.status == 'SUCCESS') {
                var order = response.data;
                var formattedOrder = {
                    pkid: order.pkid,
                    order_number: order.order_number,
                    order_type: order.order_type,
                    order_date: order.order_date,
                    charge_amount: order.total_amount,
                    price_unit: "AED",
                    remarks: 'POBOX.ORDERSTATUS.' + order.order_status,
                    order_status: order.order_status,
                    service_details: order.service_details
                };
                cb(null, formattedOrder);
            } else {
                cb(response.status, null);
            }
        });
    };

    myPoboxApiFn.prepare3DSPayment = function (req, res, next) {
        var formData = {
            account_id: reqValidator.getAccountPkId(req),
            amount: req.body.amount_to_pay,
            comma_delimited_orders: req.body.comma_delimited_order_pkids,
        };

        _log.logPayment(formData);

        var url = appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.preparePaymentUrl;
        httpModule.post(url, formData, function (response) {
            if (response.status == 'SUCCESS') {
                var data = {
                    status: response.status,
                    txn_number: response.data.TXN_NUMBER
                };
                httpModule.successResponse(res, {
                    data: data
                });
            } else {
                httpModule.errorResponse(res, {
                    description: response.message
                });
            }
            return next();
        });
    };

    myPoboxApiFn.result3DSPayment = function (req, res, next) {
        var formData = {
            customerAccountPKID: reqValidator.getAccountPkId(req),
            paidAmount: req.body.paid_amount,
            txnReference: req.body.txn_reference,
        };
        var url = appConfig.api.pobox.baseUrl + appConfig.api.pobox.result3dsPaymentUrl;
        httpModule.post(url, formData, function (response) {
            if (response.status === "ERROR") {
                httpModule.errorResponse(res, {
                    description: response.error
                });
                return next();
            } else {
                httpModule.successResponse(res, {
                    data: response
                });
                return next();
            }
        });
    };


}

module.exports = new MYPostBoxAPI();