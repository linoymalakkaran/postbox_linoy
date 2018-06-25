export default function mypoboxFactory($resource, ngAuthSettings) {
    'use strict';
    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    var postboxServiceFactory = {};

    var _getApplicationFormData = $resource(serviceBase + 'mypobox/applicationformdata?lang=:lang', {
        lang: '@lang'
    }, {
            get: {
                method: 'GET',
                transformResponse: function (response) {
                    return angular.fromJson(response);
                },
                isArray: false
            }
        });

    var _getPoboxPriceDetails = $resource(serviceBase + 'postbox/bundle/price-details', {
        box_id: '@box_id',
        lang: '@lang'
    }, {
            get: {
                method: 'GET',
                transformResponse: function (response) {
                    return angular.fromJson(response);
                },
                isArray: false
            }
        });

    let _getContractsByAccountId = $resource(serviceBase + 'mypobox/getContractsByAccountId?lang=:lang', {
        lang: '@lang'
    }, {
            get: {
                method: 'GET',
                transformResponse: function (response) {
                    return angular.fromJson(response);
                },
                isArray: false
            }
        });

    let _getOrderHistory = $resource(serviceBase + 'mypobox/getOrders', {}, {
        get: {
            method: 'GET',
            transformResponse: function (response) {
                return angular.fromJson(response);
            },
            isArray: false
        }
    });

    let _getPaymentHistory = $resource(serviceBase + 'mypobox/getPayments', {}, {
        get: {
            method: 'GET',
            transformResponse: function (response) {
                return angular.fromJson(response);
            },
            isArray: false
        }
    });

    let _getOrderDetails = $resource(serviceBase + 'mypobox/getOrderDetails?order_id=:order_id', {
        order_id: '@order_id'
    }, {
            get: {
                method: 'GET',
                transformResponse: function (response) {
                    return angular.fromJson(response);
                },
                isArray: false
            }
        });

    let _getPaymentDetails = $resource(serviceBase + 'mypobox/getPaymentDetails?payment_pkid=:payment_pkid', {
        payment_pkid: '@payment_pkid'
    }, {
            get: {
                method: 'GET',
                transformResponse: function (response) {
                    return angular.fromJson(response);
                },
                isArray: false
            }
        });

    let _getCustomerDetails = $resource(serviceBase + 'mypobox/getCustomerDetails', {}, {
        get: {
            method: 'GET',
            transformResponse: function (response) {
                return angular.fromJson(response);
            },
            isArray: false
        }
    });

    let _getReceiptDetails = $resource(serviceBase + 'mypobox/getReceiptDetails?payment_pkid=:payment_pkid', {
        payment_pkid: '@payment_pkid'
    }, {
            get: {
                method: 'GET',
                transformResponse: function (response) {
                    return angular.fromJson(response);
                },
                isArray: false
            }
        });

    let _cancelOrder = $resource(serviceBase + 'mypobox/cancelOrder?order_id=:order_id', {
        order_id: '@order_id'
    }, {
            get: {
                method: 'GET',
                transformResponse: function (response) {
                    return angular.fromJson(response);
                },
                isArray: false
            }
        });

    let _getTxnNumber = $resource(serviceBase + 'mypobox/prepare3DSPayment');

    let _getUiConfig = $resource(serviceBase + 'postbox/ui-config');

    let _getPaymentResult = $resource(serviceBase + 'mypobox/result3DSPayment');

    let _getUpgradablePoBoxDetails = $resource(serviceBase + 'upgrade/getUpgradablePoBoxDetails', {
        pobox_id: '@pobox_id',
        box_number: '@box_number',
        emirate_id: '@emirate_id',
        bundle_id: '@bundle_id',
        is_renwable: '@is_renwable',
        lang: '@lang'
    }, {
            get: {
                method: 'GET',
                transformResponse: function (response) {
                    return angular.fromJson(response);
                },
                isArray: false
            }
        });

    let _getUpgradePriceList = $resource(serviceBase + 'upgrade/upgradePriceListUrl', {
        customer_pkid: '@customer_pkid',
        pobox_pkid: '@pobox_pkid'
    }, {
            get: {
                method: 'GET',
                transformResponse: function (response) {
                    return angular.fromJson(response);
                },
                isArray: false
            }
        });

    let _upgradePoBox = $resource(serviceBase + 'upgrade/upgradePoBox', {}, {
        query: {
            method: 'POST',
            transformResponse: function (response, headers) {
                return angular.fromJson(response);
            }
        },
        isArray: false
    });

    let _getPostOffices = $resource(serviceBase + 'upgrade/PostOfficesUrl', {
        emirate_id: '@emirate_id',
        community_id: '@community_id'
    }, {
            get: {
                method: 'GET',
                transformResponse: function (response) {
                    return angular.fromJson(response);
                },
                isArray: false
            }
        });

    let _getProductPrice = $resource(
        serviceBase + 'postbox/product/price-details', {
            bundle_code: '@bundle_code',
            product_code: '@product_code',
            duration: '@duration',
            quantity: '@quantity',
            contract_type: '@contract_type',
            rent_type: '@rent_type', // NEW or RENEW
            lang: '@lang'
        }, {
            get: {
                method: 'GET',
                transformResponse: function (response) {
                    return angular.fromJson(response);
                },
                isArray: false
            }
        });

    postboxServiceFactory.getApplicationFormData = _getApplicationFormData;
    postboxServiceFactory.getContractsByAccountId = _getContractsByAccountId;
    postboxServiceFactory.getOrderHistory = _getOrderHistory;
    postboxServiceFactory.getPaymentHistory = _getPaymentHistory;
    postboxServiceFactory.getOrderDetails = _getOrderDetails;
    postboxServiceFactory.getPaymentDetails = _getPaymentDetails;
    postboxServiceFactory.getCustomerDetails = _getCustomerDetails;
    postboxServiceFactory.getReceiptDetails = _getReceiptDetails;
    postboxServiceFactory.cancelOrder = _cancelOrder;
    postboxServiceFactory.getPaymentResult = _getPaymentResult;
    postboxServiceFactory.getTxnNumber = _getTxnNumber;
    postboxServiceFactory.getUpgradablePoBoxDetails = _getUpgradablePoBoxDetails;
    postboxServiceFactory.upgradePoBox = _upgradePoBox;
    postboxServiceFactory.getPostOffices = _getPostOffices;
    postboxServiceFactory.getProductPrice = _getProductPrice;
    postboxServiceFactory.getPoboxPriceDetails = _getPoboxPriceDetails;
    postboxServiceFactory.getUiConfig = _getUiConfig;

    return postboxServiceFactory;
}