/**
 * This file is used for calling customer service API's
 */
var httpModule = require('../http_module');
var appConfig = require('../../config/app_config');

/**
 * To retrieve customer profile information
 */
exports.customerProfileDetails = function (customerPKID, callback) {
    var relativeUrl = httpModule.formatUrl(appConfig.api.customer.customerInfoUrl, [customerPKID]);
    httpModule.get(appConfig.api.customer.baseUrl + relativeUrl, function (customerDetails) {
        callback(customerDetails);
    });
};

/**
 * To retrieve smart pass customer profile information
 */
exports.customerProfileSmartPassDetails = function (customerPKID, callback) {
    var relativeUrl = httpModule.formatUrl(appConfig.api.customer.smartPassCustomerInfoUrl, [customerPKID]);
    httpModule.get(appConfig.api.customer.baseUrl + relativeUrl, function (customerDetails) {
        callback(customerDetails);
    });
};

/**
 * To retrieve customer user name exsist
 */
exports.checkUserNameAvailability = function (userName, callback) {
    httpModule.get(appConfig.api.customer.baseUrl + appConfig.api.customer.usernameAvailableUrl, function (response) {
        callback(response.status === "AVAILABLE");
    }, {
            headers: {
                'uname': userName,
                'charset': 'UTF-8'
            }
        });
};

/**
 * To create customer profile if not exsist
 */
exports.createPoBoxAccount = function (emirate, poBoxNumber, loginID, firstName, lastName, callback) {
    var formData = {
        'city': emirate,
        'pobox': poBoxNumber,
        'loginID': loginID,
        'fName': firstName,
        'lName': lastName,
    };
    httpModule.post(appConfig.api.customer.baseUrl + appConfig.api.customer.createPoBoxAccountUrl, formData, function (response) {
        callback(response);
    });
};

/**
 *create account and send email
 */
exports.emailAccountCredentials = function (customerAccountId, email, callback) {
    var relativeUrl = httpModule.formatUrl(appConfig.api.customer.emailCredentialsUrl, [customerAccountId]);
    var formData = {
        'email': email
    };
    httpModule.post(appConfig.api.customer.baseUrl + relativeUrl, formData, function (response) {
        callback(response);
    });
};

function isEmpty(obj) {
    var key;
    for (key in obj)
        return (false);
    return (true);
}

//smart pass details
exports.getSmartpassDetails = function (accountPkid, retryCount, customerDetails, smartPassCallBack) {
    if (customerDetails && customerDetails.accountProfile && customerDetails.accountProfile.LOGIN && isEmpty(customerDetails.accountProfile.LOGIN.smartpass_id)) {
        smartPassCallBack(null);
    }
    smartPassDetails = null;
    if (retryCount > 0) {
        exports.customerProfileSmartPassDetails(accountPkid, function (response) {
            smartPassDetails = response;
            // Check if ../spass returns a valid object. If not then it is not smarpass login
            if (smartPassDetails && smartPassDetails.attrs && smartPassDetails.attrs.idn !== undefined) {
                console.log('This is a smartpass login');
                // Check if moi object is present; else retry 2 more times until obtained
                if (Object.keys(smartPassDetails.moi).length > 0) {
                    console.log('MOI data available');
                    smartPassCallBack(smartPassDetails);
                } else {
                    // Retry
                    console.log('Retrying to get MOI data, retry number ' + retryCount);
                    setTimeout(function () {
                        retryCount--;
                        exports.getSmartpassDetails(accountPkid, retryCount, customerDetails, smartPassCallBack);
                    }, 5000);
                }
            } else {
                console.log('This is a local login');
                smartPassCallBack(null);
            }
        });
    } else {
        smartPassCallBack(null);
    }
};