/**
 * this is the http end point controller for accessing customer info
 *
 */
var httpModule = require('../modules/http_module'),
    customerModule = require('../modules/customer/customer_module'),
    customerModel = require('../models/customer_model'),
    utils = require('../modules/utils'),
    reqValidator = require('../modules/validate.request.module');

function CustomerAPI() {

    var BASE_URI = 'api/customer';

    this.handler = function (req, res, next) {
        var splitedUrlArray = req.path.split('/');
        var basePath = splitedUrlArray.splice(2, splitedUrlArray.length).join('/');
        switch (basePath) {
            case BASE_URI + '/checkusernameavailability':
                checkUserNameAvailability(req, res, next);
                break;
            case BASE_URI + '/getCustomerDetails':
                getCustomerLoginInfo(req, res, next);
                break;
            default:
                response = {
                    description: 'Method not found'
                };
                res.errorResponse(response);
                break;
        }
    };

    function getCustomerLoginInfo(req, res, next) {
        var accountPkid = reqValidator.getAccountPkId(req);
        var lang = reqValidator.getLang(req);
        new CustomerAPI().getCustomerDetails(accountPkid, lang, function (result) {
            let response = {
                data: result
            };
            httpModule.successResponse(res, response);
        });
    };

    this.getCustomerDetails = function (accountPkid, lang, customerDetailsCallBack) {
        customerModule.customerProfileDetails(accountPkid, function (customerDetails) {
            customerModule.getSmartpassDetails(accountPkid, 2, customerDetails, function (smartPassDetails) {
                var formData = {};

                //for testing purpose, remove before production
                //smartPassDetails = smartPassDummyJSON;

                if (smartPassDetails && smartPassDetails.status !== 'ERROR') {
                    formData = customerModel.customerSmartPassInfo(smartPassDetails, customerDetails, accountPkid, lang);
                    // if (formData.nationalityId === '1') {
                    //     formData.nationality = 'ARE';
                    // }
                } else if (customerDetails && customerDetails.status !== 'ERROR') {
                    formData = customerModel.customerLocalInfo(customerDetails, accountPkid, lang);
                }
                formData.missingFields = [];
                if (formData.isSmartPassLogin) {
                    formData.missingFields = utils.getMissingFields(formData);
                }
                customerDetailsCallBack(formData)
            });
        });
    };

    function checkUserNameAvailability(req, res, next) {
        customerModule.checkUserNameAvailability(req.query.userName, function (isAvailable) {
            if (isAvailable === undefined) {
                response = {
                    description: 'ERROR'
                };
                httpModule.errorResponse(res, response);
            } else {
                response = {
                    data: {
                        isAvailable: isAvailable
                    }
                };
                httpModule.successResponse(res, response);
            }
            return next();
        });
    };

}

module.exports = new CustomerAPI();