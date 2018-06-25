var model = {

    customerLocalInfo: function (model, accountPkId, lang) {
        return {
            pkid: accountPkId,
            isSmartPassLogin: false,
            area: getCustomerInfo(model.addressProfile.contact.area),
            building: getCustomerInfo(model.addressProfile.contact.building),
            landMark: getCustomerInfo(model.addressProfile.contact.landmark),
            emiratesId: getCustomerInfo(model.personalProfile.eida),
            firstNameEnglish: getCustomerInfo(model.customerName.english.first) || getCustomerInfo(model.customerName.arabic.first),
            firstNameArabic: getCustomerInfo(model.customerName.arabic.first) || getCustomerInfo(model.customerName.english.first),
            lastNameEnglish: getCustomerInfo(model.customerName.english.last) || getCustomerInfo(model.customerName.arabic.last),
            lastNameArabic: getCustomerInfo(model.customerName.arabic.last) || getCustomerInfo(model.customerName.english.last),
            fullNameEnglish: getCustomerInfo(model.customerName.english.full) || getCustomerInfo(model.customerName.arabic.full),
            fullNameArabic: getCustomerInfo(model.customerName.arabic.full) || getCustomerInfo(model.customerName.english.full),
            email: getCustomerInfo(model.addressProfile.contact.email),
            mobile: getCustomerInfo(model.addressProfile.contact.mobile),
            language: getCustomerInfo(model.personalProfile.language),
            gender: '',
            nationality: '',
            passportNumber: '',
            idCardIssueDate: '',
            idCardExpiryDate: '',
            familyNumber: '',
            khulasitQaidNumber: '',
            unifiedNumber: '',
            edbarahNumber: ''
        };
    },
    customerSmartPassInfo: function (model, accountPkId, lang) {
        var returnValue = this.emptyCustomerInfo();
        returnValue.pkid = accountPkId;
        returnValue.language = lang;
        if (model) {
            if (model.attrs && Object.keys(model.attrs).length === 0) {
                console.log("No Smartpass ATTRS field");
                return returnValue;
            }
            returnValue.isSmartPassLogin = true;

            if (model.attrs && Object.keys(model.attrs).length > 0) {
                console.log("Smartpass ATTRS field available");
                returnValue.smartpassId = getCustomerInfo(model.attrs.fedid);
                returnValue.area = getCustomerInfo(model.attrs.homeAddressAreaDescriptionEN);
                returnValue.building = getCustomerInfo(model.attrs.homeAddressBuildingDescriptionEN);
                returnValue.emiratesId = getCustomerInfo(model.attrs.idn);
                returnValue.fullNameEnglish = getCustomerInfo(model.attrs.fullnameEN) || getCustomerInfo(model.attrs.fullnameAR);
                returnValue.fullNameArabic = getCustomerInfo(model.attrs.fullnameAR) || getCustomerInfo(model.attrs.fullnameEN);
                returnValue.email = getCustomerInfo(model.attrs.email);
                returnValue.mobile = getCustomerInfo(model.attrs.mobile);
                returnValue.idCardIssueDate = getCustomerInfo(model.attrs.idCardIssueDate);
                returnValue.idCardExpiryDate = getCustomerInfo(model.attrs.idCardExpiryDate);
                returnValue.nationality = getCustomerInfo(model.attrs.nationalityEN);
            }
            if (model.moi && Object.keys(model.moi).length > 0) {
                console.log("MOI field available");
                var alBaldahNumber = '';
                var alUsraNumber = '';
                if (model.moi.familyBookNumber) {
                    var familyDetails = model.moi.familyBookNumber.split('/');
                    alBaldahNumber = familyDetails[0];
                    alUsraNumber = familyDetails[1];
                }

                returnValue.firstNameEnglish = getCustomerInfo(model.moi.firstNameEnglish) || getCustomerInfo(model.moi.fullEnglishName);
                returnValue.firstNameArabic = getCustomerInfo(model.moi.firstNameArabic) || getCustomerInfo(model.moi.fullArabicName);
                returnValue.lastNameEnglish = getCustomerInfo(model.moi.secondNameEnglish);
                returnValue.lastNameArabic = getCustomerInfo(model.moi.secondNameArabic);
                returnValue.gender = getCustomerInfo(model.moi.gender.enDesc);
                returnValue.nationalityId = getCustomerInfo(model.moi.nationality.id);
                returnValue.passportNumber = getCustomerInfo(model.moi.passport.number);
                returnValue.familyNumber = getCustomerInfo(model.moi.familyBookNumber);
                returnValue.passportIssueDate = getCustomerInfo(model.moi.passport.issuDate);
                returnValue.passportExpiryDate = getCustomerInfo(model.moi.passport.expiryDate);
                if (model.moi && model.moi.immigrationFile && model.moi.immigrationFile) {
                    returnValue.visaNumber = getCustomerInfo(model.moi.immigrationFile.number);
                    returnValue.visaExpiryDate = getCustomerInfo(model.moi.immigrationFile.expiryDate);
                }

                returnValue.khulasitQaidNumber = getCustomerInfo(model.moi.khulasitQaidNumber);
                returnValue.unifiedNumber = getCustomerInfo(model.moi.unifiedNumber); //Unified Number
                returnValue.edbarahNumber = getCustomerInfo(model.moi.edbarahNumber); //Al Idbarah Number
                returnValue.alBaldahNumber = getCustomerInfo(alBaldahNumber);
                returnValue.alUsraNumber = getCustomerInfo(alUsraNumber);
            }
        }
        returnValue.fullNameEnglish = returnValue.fullNameEnglish.replace(/,/g, ' ').replace(/  +/g, ' ');
        returnValue.fullNameArabic = returnValue.fullNameArabic.replace(/,/g, ' ').replace(/  +/g, ' ');

        return returnValue;
    },
    getFormData: function (custLocalDetails, custSmartPassDetails) {
        return {
            pkid: custSmartPassDetails.pkid || custLocalDetails.pkid,
            isSmartPassLogin: custSmartPassDetails.isSmartPassLogin || custLocalDetails.isSmartPassLogin,
            area: custSmartPassDetails.area || custLocalDetails.area,
            building: custSmartPassDetails.building || custLocalDetails.building,
            landMark: custSmartPassDetails.landMark || custLocalDetails.landMark,
            emiratesId: custSmartPassDetails.emiratesId || custLocalDetails.emiratesId,
            firstNameEnglish: custSmartPassDetails.firstNameEnglish || custLocalDetails.firstNameEnglish,
            firstNameArabic: custSmartPassDetails.firstNameArabic || custLocalDetails.firstNameArabic,
            lastNameEnglish: custSmartPassDetails.lastNameEnglish || custLocalDetails.lastNameEnglish,
            lastNameArabic: custSmartPassDetails.lastNameArabic || custLocalDetails.lastNameArabic,
            fullNameEnglish: custSmartPassDetails.fullNameEnglish || custLocalDetails.fullNameEnglish,
            fullNameArabic: custSmartPassDetails.fullNameArabic || custLocalDetails.fullNameArabic,
            email: custSmartPassDetails.email || custLocalDetails.email,
            mobile: custSmartPassDetails.mobile || custLocalDetails.mobile,
            language: custSmartPassDetails.language || custLocalDetails.language,
            gender: custSmartPassDetails.gender || custLocalDetails.gender,
            nationality: custSmartPassDetails.nationality || custLocalDetails.nationality,
            passportNumber: custSmartPassDetails.passportNumber || custLocalDetails.passportNumber,
            idCardIssueDate: custSmartPassDetails.idCardIssueDate || custLocalDetails.idCardIssueDate,
            idCardExpiryDate: custSmartPassDetails.idCardExpiryDate || custLocalDetails.idCardExpiryDate,
            familyNumber: custSmartPassDetails.familyNumber || custLocalDetails.familyNumber,
            khulasitQaidNumber: custSmartPassDetails.khulasitQaidNumber || custLocalDetails.khulasitQaidNumber,
            unifiedNumber: custSmartPassDetails.unifiedNumber || custLocalDetails.unifiedNumber,
            edbarahNumber: custSmartPassDetails.edbarahNumber || custLocalDetails.edbarahNumber
        };
    },
    emptyCustomerInfo: function (model) {
        return {
            pkid: '',
            isSmartPassLogin: false,
            area: '',
            building: '',
            landMark: '',
            emiratesId: '',
            firstNameEnglish: '',
            firstNameArabic: '',
            lastNameEnglish: '',
            lastNameArabic: '',
            fullNameEnglish: '',
            fullNameArabic: '',
            email: '',
            mobile: '',
            language: '',
            gender: '',
            nationality: '',
            nationalityId: '',
            passportNumber: '',
            idCardIssueDate: '',
            idCardExpiryDate: '',
            familyNumber: '',
            passportIssueDate: '',
            passportExpiryDate: '',
            visaNumber: '',
            visaPlaceOfIssue: '',
            visaExpiryDate: '',
            khulasitQaidNumber: '',
            unifiedNumber: '',
            edbarahNumber: ''
        };
    }
};

module.exports = model;

function getCustomerInfo(val) {
    if (val == '-' || val == ' ' || val == '' || val == null || val == undefined || val == [] || val == {}) {
        return '';
    } else {
        return val;
    }
}