var _entityType = {
    COUNTRY: {
        code: 'COUNTRY_ID',
        description: 'List of countries with ID number. Contains junk '
    },
    COUNTRY_ID: {
        code: 'COUNTRY_ID',
        description: 'Internal ID mapped with country. Used for all cases'
    },
    COUNTRY_CODE: {
        code: 'COUNTRY_CODE',
        description: 'Two letter code and Country Name'
    },
    OFFICE: {
        code: 'OFFICE',
        description: 'For getting areas name in pobox rental'
    },
    POST_OFFICE: {
        code: 'OFFICE_ID',
        description: 'List of post offices in UAE'
    },
    MAIL_EVENT: {
        code: 'MAIL_EVENT_ID',
        description: 'Track and Trace Module'
    },
    EMIRATE: {
        code: 'CITY_ID',
        description: 'Track and Trace Module'
    },
    PRODUCT: {
        code: 'PRODUCT',
        description: 'Needed for rent and renew PO Box. All names of Bundles and VAS'
    },
    COUNTRY_CODE_ISOA3: {
        code: 'COUNTRY_CODE_ISOA3',
        description: 'Three letter code and Country Name'
    },
    COMMUNITY: {
        code: 'COMMUNITY',
        description: 'Get the area name. Required for Renting a PO Box'
    },
    EXCHANGE_ID: {
        code: 'EXCHANGE_ID',
        description: 'For track and trace'
    },
    LANGUAGE: {
        code: 'LANGUAGE',
        description: 'For getting languages'
    },
    NATIONALITY: {
        code: 'NATIONALITY_ISO',
        description: 'For getting nationalities'
    },
    LANGUAGETRANSLATIONFORRENTBOX: {
        code: 'BOX',
        description: 'Getting all ui translations'
    }
};

exports.ENTITY_TYPE = _entityType;