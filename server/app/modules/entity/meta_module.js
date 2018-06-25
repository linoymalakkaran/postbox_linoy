var httpModule = require('../http_module');
var appConfig = require('../../config/app_config');

var _entityType = {
    COUNTRY: {
        code: "COUNTRY_ID",
        description: 'List of countries with ID number. Contains junk '
    },
    COUNTRY_ID: {
        code: "COUNTRY_ID",
        description: 'Internal ID mapped with country. Used for all cases'
    },
    COUNTRY_CODE: {
        code: "COUNTRY_CODE",
        description: 'Two letter code and Country Name'
    },
    OFFICE: {
        code: "OFFICE",
        description: 'For getting areas name in pobox rental'
    },
    POST_OFFICE: {
        code: "OFFICE_ID",
        description: 'List of post offices in UAE'
    },
    MAIL_EVENT: {
        code: "MAIL_EVENT_ID",
        description: 'Track and Trace Module'
    },
    EMIRATE: {
        code: "CITY_ID",
        description: 'Track and Trace Module'
    },
    PRODUCT: {
        code: "PRODUCT",
        description: 'Needed for rent and renew PO Box. All names of Bundles and VAS'
    },
    COMMUNITY: {
        code: "COMMUNITY",
        description: 'Get the area name. Required for Renting a PO Box'
    },
    COUNTRY_CODE_ISOA3: {
        code: 'COUNTRY_CODE_ISOA3',
        description: 'Three letter code and Country Name'
    },
    EXCHANGE_ID: {
        code: "EXCHANGE_ID",
        description: 'For track and trace'
    },
    LANGUAGETRANSLATIONFORRENTBOX: {
        code: 'BOX',
        description: 'Getting all ui translations'
    },
    LANGUAGE: {
        code: 'LANGUAGE',
        description: 'For getting languages'
    },
};

exports.getMetaByEntity = function (entityType, language, callback) {
    var url = httpModule.formatUrl(appConfig.api.translation.baseUrl + appConfig.api.translation.entityUrl, [
        language,
        entityType.code
    ]);
    httpModule.get(url, function (response) {
        var array = response.map(function (item) {
            return {
                id: item.id,
                name: item.name,
            };
        });
        return callback(array);
    });
};


exports.ENTITY_TYPE = _entityType;