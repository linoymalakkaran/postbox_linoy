/**
 * This file is used for calling post box service API's
 */
var async = require('async');
var httpModule = require('../http_module');
var appConfig = require('../../config/app_config');
var customerModule = require('../customer/customer_module.js');
var postboxModule = require('../../modules/postbox/postbox');
var metaModule = require('../../modules/entity/meta_module');

exports.getVatPrice = function (items, bundleCode, contractType, mainCallBack) {
    async.every(items, function (item, callback) {
        var url = httpModule.formatUrl(appConfig.api.tax.baseUrl + appConfig.api.tax.vat, [bundleCode, item.product_code, contractType, 'NEW', new Date().getFullYear(), 1, 'VAT']);
        httpModule.get(url, function (result, err) {
            if (result && result.status.toUpperCase() == "SUCCESS") {
                item.vat = parseFloat(result.data.tax);
                item.vatpercent = result.data.percent;
                callback(null, !err)
            } else {
                item.vat = 0;
                item.vatpercent = 0;
                callback(null, !err)
            }
        });
    }, function (err, result) {
        if (!err) {
            mainCallBack(true);
        } else {
            mainCallBack(false);
        }
    });
};

exports.getContractsByAccountId = function (accountPkId, callback) {
    var url = httpModule.formatUrl(appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.contractsByAccountIdUrl, [accountPkId]);
    httpModule.get(url, function (contracts) {
        if (contracts && contracts.status === "SUCCESS") {
            return callback(contracts.data);
        } else {
            return callback([]);
        }
    });
};

exports.getContractsByAccountIdAsync = function (accountPkId) {
    return new Promise((resolve, reject) => {
        var url = httpModule.formatUrl(appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.contractsByAccountIdUrl, [accountPkId]);
        httpModule.get(url, function (contracts) {
            if (contracts && contracts.status === "SUCCESS") {
                return resolve(contracts.data);
            } else {
                return resolve([]);
            }
        });
    });
};

exports.getAreaName = function (areaList, areaObj) {
    var area = areaList.find(function (x) {
        return x.id === areaObj.area_id;
    });
    if (area !== undefined)
        return area.name;
    return areaObj.area_name;
};

exports.getPostOffices = function (areaList, areaObj) {
    var area = areaList.find(function (x) {
        return x.id === areaObj.id;
    });
    if (area !== undefined)
        return area.name;
    return areaObj.name;
};

exports.removeOrderCancelled = function (order) {
    return order.remarks !== "Cancelled";
};

exports.getProductName = function (productList, code) {
    var product = productList.find(function (x) {
        return x.id === code;
    });
    if (product !== undefined)
        return product.name;
    return "";
};

exports.getEmirateName = function (emirates, code) {
    var emirate = emirates.find(function (x) {
        return x.id === code;
    });
    if (emirate !== undefined)
        return emirate.name;
    return "";
};

exports.getOfficeName = function (officeList, code) {
    var office = officeList.find(function (x) {
        return x.id === code;
    });
    if (office !== undefined)
        return office.name;
    return "";
};

exports.changeDesc = function (value, desc) {
    for (var i in projects) {
        if (projects[i].value == value) {
            projects[i].desc = desc;
            break; //Stop this loop, we found it!
        }
    }
};

exports.saveSurveyResult = function (data, mobile, email) {
    var formData = {
        IsHomeDeliverySelected: data.is_home_delivery_selected,
        SurveyType: 'renew',
        PostboxCustomer: {
            NameInEnglish: data.owner.name.english.full,
            NameInArabic: data.owner.name.arabic.full,
            Mobile: mobile,
            Email: email,
            Emirate: data.emirateName,
            PoboxNumber: data.box.box_id,
            loginID: data.account_id
        }
    };

    var url = appConfig.api.postBoxsurvey.baseUrl + appConfig.api.postBoxsurvey.save;
    httpModule.post(url, formData, function (response) {
        if (response) {
            console.log('Survey feedback saved successfully.');
        } else {
            console.log('Survey feedback save failed.');
        }
    }, {
            headers: {
                'Content-Type': 'application/json',
                'charset': 'UTF-8'
            }
        });
};

exports.getDuePriceList = function (pobox_id, lang, callBack) {
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
        postboxModule.ProductPriceMapping(lang, duesListResponse.data.service_details, result, callBack);
    });
};

exports.ProductPriceMapping = function (lang, duesListData, result, callBack) {
    metaModule.getMetaByEntity(metaModule.ENTITY_TYPE.PRODUCT, lang, function (productList) {
        if (duesListData && duesListData.length > 0) {
            duesListData.map(function (due) {
                var resultMapped = {
                    isAdditionalService: due.criteria === 'A' ? true : false,
                    criteria: due.criteria,
                    service_id: due.service_id,
                    service_code: due.service_code,
                    product_name: postboxModule.getProductName(productList, due.service_code),
                    unit_price: due.unit_price,
                    amount: due.amount,
                    price_unit: "AED",
                    quantity: due.quantity,
                    is_selected: due.criteria === 'M' ? true : false,
                    vat: due.is_taxable ? parseFloat(due.taxes[0].amount) : 0,
                    vatpercent: due.is_taxable ? due.taxes[0].percentage : 0
                }
                if (due.criteria === 'M') {
                    result.mandatoryServices.push(resultMapped);
                } else if (due.criteria === 'A') {
                    result.additionalServices.push(resultMapped);
                }
            });
            return callBack(result);
        } else {
            return callBack(result);
        }
    });
};

//old method
exports.formatContract = function (productList, emirates, offices, contract, customerDetails, callback) {
    var amount = 0;
    var tax = 0;
    var net_amount = 0;
    var formattedContract = {
        pkid: contract.pkid,
        rented_on: contract.rentedOn,
        contract_details: contract.contractDetails.map(function (item) {
            amount += item.amount;
            tax += item.tax;
            net_amount = item.amount + item.tax;
            return {
                pkid: item.pkid,
                product_code: item.productCode,
                product_name: exports.getProductName(productList, item.productCode),
                quantity: item.quantity,
                unit_price: item.unitPrice,
                amount: item.amount,
                tax: item.tax,
                net_amount: item.amount + item.tax,
                price_unit: "AED",
                valid_from: item.validFrom,
                valid_until: item.validUntil
            };
        }),
        status: contract.status,
        contract_type: contract.contractType === "P" ? "Personal" : "Corporate",
        renewable: contract.renewable,
        upgradable: contract.isUpgradable,
        customer_pkid: contract.customerPkid,
        customer_name: customerDetails.customerName.english.full + ' / ' +
            customerDetails.customerName.arabic.full,
        addressProfile: customerDetails.addressProfile,
        personalProfile: customerDetails.personalProfile,
        rent_box: {
            box_pkid: contract.rentBox.boxPkid,
            box_number: contract.rentBox.boxNumber,
            box_location: exports.getOfficeName(offices, contract.rentBox.boxLocation),
            admin_office: exports.getOfficeName(offices, contract.rentBox.adminOffice),
            admin_office_city: exports.getEmirateName(emirates, contract.rentBox.adminOfficeCity),
            admin_office_city_id: contract.rentBox.adminOfficeCity
        },
        door_delivery_required: contract.doorDeliveryRequired,
        valid_from: contract.validFrom,
        valid_until: contract.validUntil,
        renewed_on: contract.renewedOn,
        remarks: contract.remarks,
        amount: 0,
        tax: 0,
        net_amount: 0
    };
    formattedContract.amount = amount;
    formattedContract.tax = tax;
    formattedContract.net_amount = net_amount;
    callback(null, formattedContract);
};

exports.bundleMapping = function (lang, contractType, bundleList) {
    var bundlePath = '../../locales/' + lang + '.json';
    var locales = require(bundlePath);
    var bundles = contractType === 'P' ? locales.POBOX.BUNDLE.individual : locales.POBOX.BUNDLE.corporate;
    var mappedBundleList = bundleList.map(c => {
        return Object.assign({}, c, getBundleMappedObject(c, bundles));
    });
    return mappedBundleList.filter(c => c.priority != null && c.eservice_enabled).sort((a, b) => a.priority - b.priority);
};

exports.getPaymentDetailsByPaymentId = function (paymentId, accountPkId) {
    return new Promise(resolve => {
        var url = httpModule.formatUrl(appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.PaymentInfoWithOrderDetailsUrl, [paymentId, accountPkId]);
        httpModule.get(url, function (response) {
            if (response && response.status == 'SUCCESS' && response.data) {
                resolve({ payments: response.data });
            } else {
                resolve(null);
            }
        });
    });
};

function getBundleMappedObject(bundlePOS, bundlesLocal) {
    var bundleObj = bundlesLocal.filter(c => c.code == bundlePOS.id)
        .map(c => {
            return {
                title: c.title,
                features: c.features,
                footnote: c.footnote,
                priority: c.priority,
                eservice_enabled: c.eservice_enabled
            }
        });
    return bundleObj[0];
}