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

exports.getContractsByAccountId = function (accountPkId, lang, next) {
    async.parallel({
        customerNumbers: function (callback) {
            customerModule.customerProfileDetails(accountPkId, function (customerDetails) {
                getcontractCustomerNumbers(customerDetails, function (customerNumbers) {
                    callback(null, customerNumbers);
                });
            });
        },
        productList: function (callback) {
            metaModule.getMetaByEntity(metaModule.ENTITY_TYPE.PRODUCT, lang, function (productList) {
                callback(null, productList);
            });
        },
        emirates: function (callback) {
            metaModule.getMetaByEntity(metaModule.ENTITY_TYPE.EMIRATE, lang, function (emirateList) {
                callback(null, emirateList);
            });
        },
        offices: function (callback) {
            metaModule.getMetaByEntity(metaModule.ENTITY_TYPE.OFFICE, lang, function (officeList) {
                callback(null, officeList);
            });
        }
    }, function (err, results) {
        if (!err) {
            getBoxInfo(results.customerNumbers, function (contracts) {
                async.map(contracts,
                    exports.formatContractForPobox.bind(null, results.productList, results.emirates, results.offices, accountPkId),
                    function (err, formattedContracts) {
                        return next(formattedContracts);
                    });
            });
        } else {
            return next();
        }
    });
};

exports.getFormattedContract = function (productList, emirates, offices, contract, callback) {
    customerModule.customerProfileDetails(contract.customerPkid, function (customerDetails) {
        exports.formatContract(productList, emirates, offices, contract, customerDetails, callback);
    });
};

var getBoxInfo = function (customerNumbers, callback) {
    var url = appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.poboxByCustomerNumber;
    var data = {
        customer_number_csv: customerNumbers.join(',')
    };
    httpModule.post(url, data, function (boxDetails, err) {
        if (boxDetails && boxDetails.data && boxDetails.code === "0") {
            callback(boxDetails.data)
        } else {
            callback([])
        }
    });
};

var getcontractCustomerNumbers = function (customerDetails, mainCallBack) {
    var customerLinks = customerDetails.customerLinks;
    var customerNumbers = [];
    async.every(customerLinks, function (item, callback) {
            if (item.bpkid === "0") {
                customerModule.customerProfileDetails(item.pkid, function (customerDetails, err) {
                    if (customerDetails && customerDetails.customerNumber) {
                        customerNumbers.push(customerDetails.customerNumber);
                        callback(null, !err)
                    } else {
                        callback(null, !err)
                    }
                });
            }
        },
        function (err, result) {
            if (!err) {
                mainCallBack(customerNumbers);
            } else {
                mainCallBack(customerNumbers);
            }
        });
};

exports.formatContractForPobox = function (productList, emirates, offices, accountPkId, contract, callback) {
    var formattedContract = {
        customer_number: contract.customer_number,
        bundle_id: contract.bundle_id,
        rented_on: contract.rented_on,
        status: contract.status,
        contract_type: contract.rent_type === "P" ? "Personal" : "Corporate",
        renewable: contract.renewable,
        upgradable: contract.upgradable,
        customer_pkid: accountPkId,
        customer_name: contract.owner.name.english.full + ' / ' +
            contract.owner.name.arabic.full,
        addressProfile: contract.owner.contact_address,
        personalProfile: contract.owner.personal_profile,
        rent_box: {
            door_delivery_required: contract.door_delivery_required,
            box_pkid: contract.rent_box.box_id,
            box_number: contract.rent_box.box_number,
            box_location: exports.getOfficeName(offices, contract.rent_box.area_id),
            admin_office: exports.getOfficeName(offices, contract.rent_box.area_id),
            admin_office_city: exports.getEmirateName(emirates, contract.rent_box.emirate_id),
            admin_office_city_id: contract.rent_box.emirate_id
        },
        door_delivery_required: contract.door_delivery_required,
        valid_from: contract.valid_from,
        valid_until: contract.valid_until != null ? new Date(contract.valid_until).toDateString() : contract.valid_until,
        renewed_on: contract.renewed_on,
        remarks: contract.remarks
    };
    callback(null, formattedContract);
}

var getBoxContractInfo = function (items, mainCallBack) {
    async.every(items, function (item, callback) {
        var relativeUrl = httpModule.formatUrl(appConfig.api.postboxpos.boxInfo, [item.rent_box.box_id]);
        httpModule.get(appConfig.api.postboxpos.baseUrl + relativeUrl, function (boxDetails, err) {
            if (boxDetails && boxDetails.data && boxDetails.code === "0") {
                item.contractDetails = boxDetails.data;
                callback(null, !err)
            } else {
                item.contractDetails = {};
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

exports.getArea = function (areaList, areaObj) {
    var area = areaList.find(function (x) {
        return x.id === areaObj.area_id;
    });
    if (area !== undefined)
        return area.name;
    return areaObj.area_name;
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
        IsHomeDeliverySelected: data.isHomeDeliverySelected,
        SurveyType: 'renew',
        PostboxCustomer: {
            NameInEnglish: data.owner.name.english.full,
            NameInArabic: data.owner.name.arabic.full,
            Mobile: mobile,
            Email: email,
            Emirate: data.emirateName,
            PoboxNumber: data.boxPKID,
            loginID: data.accountPKID
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
        postboxModule.ProductPriceMapping(lang, duesListResponse, result, callBack);
    });
};

exports.ProductPriceMapping = function (lang, duesListResponse, result, callBack) {
    metaModule.getMetaByEntity(metaModule.ENTITY_TYPE.PRODUCT, lang, function (productList) {
        var duesListData = duesListResponse.data.service_details;
        var duesList = [];
        if (duesListData && duesListData.length > 0) {
            duesList = duesListData.map(function (due) {
                return productdetails = {
                    isAdditionalService: due.criteria === 'A' ? true : false,
                    criteria: due.criteria,
                    service_id: due.service_id,
                    product_code: due.service_code,
                    product_name: postboxModule.getProductName(productList, due.service_code),
                    unit_price: due.unit_price,
                    amount: due.amount,
                    price_unit: "AED",
                    quantity: due.quantity,
                    vat: due.is_taxable ? parseFloat(due.taxes[0].amount) : 0,
                    vatpercent: due.is_taxable ? due.taxes[0].percentage : 0
                };
            });

            for (var i = 0; i < duesList.length; i++) {
                if (duesList[i].criteria === 'M') {
                    result.mandatoryServices.push(duesList[i]);
                } else if (duesList[i].criteria === 'A') {
                    result.additionalServices.push(duesList[i]);
                }
            }
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