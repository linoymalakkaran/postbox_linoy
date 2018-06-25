var appConfig = require('../config/app_config');

exports.findProp = function (obj, key, out) {
    var i,
        proto = Object.prototype,
        ts = proto.toString,
        hasOwn = proto.hasOwnProperty.bind(obj);

    if ('[object Array]' !== ts.call(out)) out = [];

    for (i in obj) {
        if (hasOwn(i)) {
            if (i === key) {
                out.push(obj[i]);
            } else if ('[object Array]' === ts.call(obj[i]) || '[object Object]' === ts.call(obj[i])) {
                this.findProp(obj[i], key, out);
            }
        }
    }
    return out;
};

exports.customLogging = function (req, data, msgName, type) {
    try {
        if (type === 'debug') {
            req.log.debug(data, msgName);
        }
        if (type === 'error') {
            req.log.error(data, msgName);
        }
    } catch (ex) {}
};

exports.saveSurveyResult = function (req, data, msgName, type) {
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


exports.getMissingFields = function (obj) {
    var missingFields = [];
    // var excludedItems = ['alUsraNumber', 'edbarahNumber', 'unifiedNumber', 'khulasitQaidNumber', 'visaExpiryDate', 'visaNumber', 'landMark', 'building', 'area', 'gender', 'language', 'lastNameArabic', 'lastNameEnglish', 'visaPlaceOfIssue'];
    var excludedItems = ['landMark', 'building', 'area', 'gender', 'language', 'lastNameArabic', 'lastNameEnglish', 'visaPlaceOfIssue', 'email', 'mobile'];
    if (obj.nationalityId === '1') { //If emirati
        // excludedItems.push('passportIssueDate');
        // excludedItems.push('passportExpiryDate');
        // excludedItems.push('passportNumber');
        // excludedItems.push('visaNumber');
        // excludedItems.push('visaExpiryDate');
    } else {
        excludedItems.push('familyNumber');
        excludedItems.push('khulasitQaidNumber');
        excludedItems.push('unifiedNumber');
        excludedItems.push('edbarahNumber');
        excludedItems.push('alBaldahNumber');
        excludedItems.push('alUsraNumber');
    }
    excludedItems.push('visaNumber');
    excludedItems.push('visaExpiryDate');
    for (var propName in obj) {
        if ((obj[propName] === null || obj[propName] === undefined || obj[propName] === '') && !excludedItems.includes(propName)) {
            missingFields.push(propName);
        }
    }
    return missingFields;
};