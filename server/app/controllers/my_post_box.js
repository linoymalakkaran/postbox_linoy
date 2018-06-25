/**
 * SERVE POINT Controller
 * this is the http end point controller for managing my postbox  informations
 *
 */
var fs = require('fs');
var httpModule = require('../modules/http_module');
var customerModule = require('../modules/customer/customer_module');
var path = require('path');
var appConfig = require('../config/app_config');
var poboxModule = require('../modules/postbox/postbox');
var _log = require('../modules/log-module');
var validateRequestModule = require('../modules/validate.request.module');
var apiMyPostBoxController = require('./api_my_post_box');

function MypostboxController() {

    var BASE_URI = '';

    this.handler = function (req, res, next) {
        switch (req.url) {
            case BASE_URI + '/':
            case BASE_URI + '/mypobox':
                handleInitialView(req, res, next);
                break;
            case BASE_URI + '/rent/individual':
            case BASE_URI + '/rent/cororate':
                handleInitialRentView(req, res, next);
                break;
            default:
                response = {
                    description: 'Method not found(404)'
                };
                res.errorResponse(response);
                break;
        }
    };

    function handleInitialRentView(req, res, next) {
        var htmlFilePath = path.join(__dirname, '../../public/individual/' + indexBasePath + '/' + indexFileName);
        routeHandler(htmlFilePath, req, res, next);
    }

    //for displaying initial rent individual or corporate page
    function handleInitialNewboxView(req, res, next) {
        var htmlFilePath = path.join(__dirname, '../../public/index.html');
        var lang = req.body.lang || 'en';
        var accountPkId = req.body.suid || '000';
        data = {
            lang,
            accountPkId,
            route: req.body.uiroute
        };
        res.cookie('mypoboxInfo', JSON.stringify(data));
        validateRequestModule.setPOBoxToken(res, accountPkId, lang);
        res.sendFile(htmlFilePath);
    }

    this.paymentReceiptHandlerView = function (req, res, next) {
        var htmlFilePath = path.join(__dirname, '../../public/index.html');
        routeHandler(htmlFilePath, req, res, next);
    }


    function handleInitialView(req, res, next) {
        var htmlFilePath = path.join(__dirname, '../../public/index.html');
        routeHandler(htmlFilePath, req, res, next);
    }

    this.handlePaymentResponse = function (req, res, next) {
        console.log('handling payment response');

        /*
            Call from payment gateway looks like below:
            http://localhost:7377/testing_mypostbox/paymenthandler/18930821?TXN_GUID=1128731
            &TXN_REF=EPPBX245268&STATUS=FAILURE&AUTH_CODE=&
            PG_REF=1045739980949572&ERROR_CODE=20010&AMOUNT=385
        */

        var paymentDetails = {
            referer: req.body.PG_REF,
            txnGUID: req.body.TXN_GUID,
            reqStatus: req.body.STATUS,
            paidAmount: req.body.AMOUNT,
            txnReference: req.body.TXN_REF,
            customerAccountPKID: req.params.accountPkId
        };

        _log.logPayment(paymentDetails);

        var formData = {
            account_id: req.params.accountPkId,
            amount: req.body.AMOUNT,
            transaction_ref_number: req.body.TXN_REF
        };
        var url = appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.paymentResultUrl;
        httpModule.post(url, formData, function (response) {
            if (req.body.STATUS === 'SUCCESS') {
                var htmlFilePath = path.join(__dirname, '../../public/paymentsuccess.html');
                fs.readFile(htmlFilePath, function (err, buf) {
                    var txt = buf.toString();
                    txt = txt.replace('{{amount}}', req.body.AMOUNT)
                        .replace('{{txn}}', req.body.TXN_REF)
                        .replace('{{mypobox_url}}', appConfig.mypobox_url);
                    res.set('Content-Type', 'text/html');
                    res.send(new Buffer(txt));
                });
                var lang = 'en';
                apiMyPostBoxController.sendPaymentNotification(req.body.TXN_REF, req.params.accountPkId, lang);
            } else {
                var htmlFilePath = path.join(__dirname, '../../public/paymenterror.html');
                fs.readFile(htmlFilePath, function (err, buf) {
                    var txt = buf.toString();
                    txt = txt.replace('{{amount}}', req.body.AMOUNT)
                        .replace('{{txn}}', req.body.TXN_REF)
                        .replace('{{mypobox_url}}', appConfig.mypobox_url);
                    res.set('Content-Type', 'text/html');
                    res.send(new Buffer(txt));
                });
            }
        });
    }

    async function routeHandler(htmlFilePath, req, res, next) {
        console.log('request params:' + JSON.stringify(req.body));
        let accountPkId = req.body.suid,
            lang = req.body.lang || 'en',
            route = req.body.uiroute,
            contractType = req.body.contract_type,
            paymentid = req.body.paymentid || null;

        var data = {
            lang,
            accountPkId,
            route: route,
            contractType,
            paymentid
        };

        if (accountPkId && route == 'mypobox') {
            let contracts = await poboxModule.getContractsByAccountIdAsync(accountPkId);
            if (contracts) {
                res.cookie('mypoboxInfo', JSON.stringify(data));
                validateRequestModule.setPOBoxToken(res, accountPkId, lang);
                logResponse(res, {
                    status: '200',
                    page: htmlFilePath,
                    data: data
                }, 'MYPOBOX_PAGE_DATA');
                res.sendFile(htmlFilePath);
            } else {
                htmlFilePath = notFoundPageRedirection(htmlFilePath, res);
            }
        } else if (route == 'rent' || route == 'rentlanding') {
            res.cookie('mypoboxInfo', JSON.stringify(data));
            validateRequestModule.setPOBoxToken(res, accountPkId, lang);
            logResponse(res, {
                status: '200',
                page: htmlFilePath,
                data: data
            }, 'MYPOBOX_PAGE_DATA');
            res.sendFile(htmlFilePath);
        } else {
            notFoundPageRedirection(htmlFilePath, res);
        }
    }

    function notFoundPageRedirection(htmlFilePath, res) {
        htmlFilePath = path.join(__dirname, '../../public/404.html');
        logResponse(res, {
            status: '404',
            page: htmlFilePath,
            data: {}
        }, 'MYPOBOX_PAGE_DATA');
        res.sendFile(htmlFilePath);
        return htmlFilePath;
    }
}

function logResponse(res, responseContainer, responseType) {
    try {
        if (!responseType) {
            responseType = 'MYPOBOX_RESPONSE';
        }

        if (res.req.log) {
            res.req.log.debug({
                url: res.req.url,
                time: new Date(),
                data: responseContainer,
            }, responseType);
        }
    } catch (ex) { }
}

module.exports = new MypostboxController();