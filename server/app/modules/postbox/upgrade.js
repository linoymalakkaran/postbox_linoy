/**
 * This file is used for calling post box upgrade service API's
 */
var httpModule = require('../http_module');
var appConfig = require('../../config/app_config');
var postboxModule = require('../../modules/postbox/postbox');
var metaModule = require('../../modules/entity/meta_module');
var entityModule = require('../../modules/entity/meta_module');



exports.getDeliveryOffices = function (emirateId, lang, callBack) {
    var url = httpModule.formatUrl(appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.getDeliveryOfficesUrl, [emirateId]);
    httpModule.get(url, function (result) {
        if (result && result.status === 'SUCCESS') {
            //var metaEntity = metaModule.ENTITY_TYPE.COMMUNITY;
            var metaEntity = metaModule.ENTITY_TYPE.OFFICE;
            var areasResponse = result.data;
            metaModule.getMetaByEntity(metaEntity, lang, function (areaList) {
                var array = [];
                if (areaList) {
                    array = areasResponse.map(function (item) {
                        return {
                            id: item.id,
                            name: postboxModule.getPostOffices(areaList, item)
                        };
                    });
                    array.sort(function (a, b) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;
                        return 0;
                    });
                }
                if (array.length === 0) {
                    callBack(null);
                } else {
                    callBack(array);
                }
            });
        } else {
            callBack(null);
        }
    });
};

exports.getUpgradablePoboxDetails = function (box_number, emirate_id, lang, callBack) {

    var url = httpModule.formatUrl(appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.upgradablePoBoxDetailsUrl, [box_number, emirate_id]);
    httpModule.get(url, function (result) {
        if (result && result.status === 'SUCCESS') {
            priceMapping(lang, result.data, callBack);
        } else {
            callBack(null);
        }
    });
};

function priceMapping(lang, bundleDetails, callBack) {
    entityModule.getMetaByEntity(metaModule.ENTITY_TYPE.PRODUCT, lang, function (productList) {
        var array = [];
        if (bundleDetails && bundleDetails.bundles.length > 0) {
            array = bundleDetails.bundles.map(function (bundle) {
                return productdetails = {
                    isAdditionalService: bundle.criteria === 'A' ? true : false,
                    service_id: bundle.service_id,
                    service_code: bundle.service_code,
                    product_name: postboxModule.getProductName(productList, bundle.service_code) || bundle.service_code,
                    unit_price: bundle.unit_price,
                    amount: bundle.amount,
                    price_unit: "AED",
                    quantity: 1,
                    vat: bundle.is_taxable ? parseFloat(bundle.taxes[0].amount) : 0,
                    vatpercent: bundle.is_taxable ? bundle.taxes[0].percentage : 0,
                    service_id: bundle.service_id,
                    valid_from: bundle.valid_from,
                    valid_until: bundle.valid_until,
                    for_year: bundle.for_year,
                    remarks: bundle.remarks,
                    criteria: bundle.criteria,
                    period: bundle.period,
                    is_taxable: bundle.is_taxable,
                    is_selected: true
                };
            });
            return callBack({
                bundles: array
            });
        } else {
            return callBack({
                bundles: null
            });
        }
    });
}

exports.upgradePoBox = function (box_id, requestJson, callBack) {

    var url = httpModule.formatUrl(appConfig.api.postboxpos.baseUrl + appConfig.api.postboxpos.upgradePoBoxUrl, [box_id]);
    httpModule.post(url, requestJson, function (result) {
        if (result && result.code === '0') {
            callBack(result);
        } else {
            callBack(null);
        }
    });
};