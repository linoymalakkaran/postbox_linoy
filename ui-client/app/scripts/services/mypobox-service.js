import { toJson } from "@uirouter/core";

export default function formHelper($rootScope, $sce, $filter, toaster) {
    'use strict';

    this.getBasePath = function () {
        var templatePath = 'views/';
        if (WEBPACK_MODE !== 'dev') {
            templatePath = 'mypostbox/public/' + templatePath;
        }
        return templatePath;
    }

    this.getBaseStaticPath = function () {
        var templatePath = 'static/';
        if (WEBPACK_MODE !== 'dev') {
            templatePath = 'mypostbox/public/' + templatePath;
        }
        return templatePath;
    }

    this.validateForm = function (form) {
        if (form.$valid) {
            return true;
        } else {
            var messages = [];
            if (form.$error.required !== undefined) {
                form.$error.required.map(function (item) {
                    var splitedName = item.$name.split('___');
                    var msg = '';
                    if (splitedName[1]) {
                        msg = $filter("i18n")(splitedName[0]) + ':  ' + $filter("i18n")(splitedName[1]) + ' ' + $filter("i18n")('org.apache.myfaces.trinidad.UIXEditableValue.REQUIRED');
                    } else {
                        msg = $filter("i18n")(item.$name) + ' ' + $filter("i18n")('org.apache.myfaces.trinidad.UIXEditableValue.REQUIRED');
                    }
                    messages.push(msg);
                });
            }
            if (form.$error.pattern !== undefined) {
                form.$error.pattern.map(function (item) {
                    var splitedName = item.$name.split('___');
                    var msg = '';
                    if (splitedName[1]) {
                        msg = $filter("i18n")(splitedName[0]) + ':  ' + $filter("i18n")(splitedName[1]) + ' ' + $filter("i18n")('ERR_MSG_INVALIDENTRY');
                    } else {
                        msg = $filter("i18n")(item.$name) + ' ' + $filter("i18n")('ERR_MSG_INVALIDENTRY');
                    }
                    messages.push(msg);
                });
            }

            if (messages.length > 0) {
                showMessages(true, messages);
            }
            return false;
        }
    }

    function showMessages(show, messages) {
        if (show) {
            var html = "<ul class='list-group' style='padding-top: 20px;'>";
            for (var i = 0; i < messages.length; i++) {
                html += "<li style='margin-bottom:1.5px;padding: 2px;'>" + (i + 1).toString() + '. ' + messages[i] + "</li>";
            }
            html += "</ul>";
            $rootScope.epDialog = html;

            toaster.pop({
                type: 'error',
                //title: 'Validation Messages.',
                body: html,
                bodyOutputType: 'trustedHtml',
                showCloseButton: true
            });
        }
    }

    this.initRegexPatterns = function () {
        $rootScope.emailPattern = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/;
        $rootScope.numberPattern = /^\d+$/;
        $rootScope.decimalPattern = /^(\d+\.?\d{0,9}|\.\d{1,2})$/;
        $rootScope.phonePattern = /^((00971)[0-9]{9}|(971)[0-9]{9}|(05)[0-9]{8}|(5)[0-9]{8})$/;
        //$rootScope.datePattern = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
        $rootScope.datePattern = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
        //$rootScope.datePattern = /^\d{4}-\d{2}-\d{2}$/;
        $rootScope.selectBoxPattern = /^fd/;
    }

    this.createUpgradeModel = function (formData, boxInfo) {
        return {
            is_renewable: formData.isRenewable,
            upgrade_request: getUpgradeDetails(formData),
            renew_request: this.getRenewModel(formData)
        };
    };

    function getUpgradeDetails(formData) {
        return {
            rent_type: formData.boxInfo.rent_type,
            account_id: formData.boxInfo.customer_pkid,
            txn_location: "WEB",
            transaction_type: "UPGRADE",
            new_bundle_id: formData.model.selectedBundle.id,
            box: {
                box_id: formData.boxInfo.rent_box.box_id,
                box_number: formData.boxInfo.rent_box.box_number,
                emirate_id: formData.boxInfo.rent_box.emirate_id,
                area_type: formData.boxInfo.rent_box.area_type,
                area_id: formData.boxInfo.rent_box.area_id
            },
            order: getOrderDetails(formData.upgradePriceList),
            contact_address: {
                flatnumber: getFormattedData(formData.model.villaNumber),
                makani: formData.model.makani,
                area: getFormattedData(formData.model.location),
                landmark: getFormattedData(formData.model.landmark),
                mobile: getFormattedData(formData.model.mobile),
                email: getFormattedData(formData.model.email),
                community: getFormattedData(formData.model.community),
                gpsx: formData.model.gpsX,
                gpsy: formData.model.gpsY
            }
        };
    };

    this.getRenewModel = function (formData) {
        return {
            rent_type: formData.boxInfo.rent_type,
            txn_location: "WEB",
            transaction_type: "RENEWAL",
            account_id: formData.boxInfo.customer_pkid,
            contact_address: {
                flatnumber: getFormattedData(formData.model.villaNumber),
                makani: formData.model.makani,
                area: getFormattedData(formData.model.location),
                landmark: getFormattedData(formData.model.landmark),
                mobile: getFormattedData(formData.model.mobile),
                email: getFormattedData(formData.model.email),
                community: getFormattedData(formData.model.community)
            },
            business_address: formData.boxInfo.owner.business_address,
            box: {
                box_id: formData.boxInfo.rent_box.box_id,
                box_number: formData.boxInfo.rent_box.box_number,
                emirate_id: formData.boxInfo.rent_box.emirate_id,
                area_type: formData.boxInfo.rent_box.area_type,
                area_id: formData.boxInfo.rent_box.area_id
            },
            owner: formData.boxInfo.owner,
            requestor: {},
            agents: [],
            trade_licenses: [{
                trade_license_number: null,
                trade_license_expiry_date: formData.model.tradeLicenseExpiryDate != null ? formData.model.tradeLicenseExpiryDate.getDateFormatForDM() : null,
            }],
            order: getOrderDetails(formData.renewDetails),
            end_year: new Date(formData.boxInfo.renewed_valid_until).getFullYear(), //formData.boxInfo.valid_until,
            bundle_id: formData.boxInfo.bundle_id
        }
    }

    this.setRentModel = function (scopeModel) {
        debugger;
        scopeModel.model.area = scopeModel.customerDetails.area;
        scopeModel.model.mobile = scopeModel.customerDetails.mobile;
        scopeModel.model.email = scopeModel.customerDetails.email;
        scopeModel.model.firstName = scopeModel.customerDetails.firstNameEnglish;
        scopeModel.model.lastName = scopeModel.customerDetails.lastNameEnglish;
        scopeModel.model.fullNameArabic = scopeModel.customerDetails.fullNameArabic;
        scopeModel.model.fullNameEnglish = scopeModel.customerDetails.fullNameEnglish;
        scopeModel.model.firstNameEnglish = scopeModel.customerDetails.firstNameEnglish;
        scopeModel.model.firstNameArabic = scopeModel.customerDetails.firstNameArabic;
        scopeModel.model.lastNameEnglish = scopeModel.customerDetails.lastNameEnglish;
        scopeModel.model.lastNameArabic = scopeModel.customerDetails.lastNameArabic;
        scopeModel.model.trade_license_number = scopeModel.customerDetails.trade_license_number;
        scopeModel.model.trade_license_expiry_date = scopeModel.customerDetails.trade_license_expiry_date != null ? scopeModel.customerDetails.trade_license_expiry_date.getDateFormatForVM('DD-MM-YYYY') : null;
    }

    this.setBillingInfo = function (formData) {
        var lang = window.mypoboxtables.mypoboxInfo.lang;
        var nameDetails = {
            english: {
                first: formData.model.firstName,
                last: formData.model.lastName,
                full: formData.model.firstName + ' ' + formData.model.lastName
            },
            arabic: {
                first: lang == 'ar' ? formData.model.firstName : '',
                last: lang == 'ar' ? formData.model.lastName : '',
                full: lang == 'ar' ? formData.model.firstName + ' ' + formData.model.lastName : ''
            }
        };

        var personal_profile = {
            eida: formData.model.emiratesId,
            eida_expiry_date: formData.model.emirtesIdExpiryDate != null ? formData.model.emirtesIdExpiryDate.getDateFormatForDM() : null,
            nationality: formData.model.selectedNationality != null ? formData.model.selectedNationality : null,
            passport_number: formData.model.passportNo,
            passport_issue_date: formData.model.passportIssueDate != null ? formData.model.passportIssueDate.getDateFormatForDM() : null,
            passport_expiry_date: formData.model.passportExpiryDate != null ? formData.model.passportExpiryDate.getDateFormatForDM() : null,
            area: formData.model.area,
            mobile: formData.model.mobile,
            email: formData.model.email,
            lang: formData.model.selectedLanguage != null ? formData.model.selectedLanguage.id : null,
            trade_license_number: formData.model.tradeLicenseNumber,
            trade_license_issue_date: formData.model.tradeLicenseIssueDate != null ? formData.model.tradeLicenseIssueDate.getDateFormatForDM() : null,
            trade_license_expiry_date: formData.model.tradeLicenseExpiryDate != null ? formData.model.tradeLicenseExpiryDate.getDateFormatForDM() : null,
            trade_license_city: formData.model.tradeLicenseIssuePlace,
            sponsor_name_en: lang == 'en' ? formData.model.sponsorName : '',
            sponsor_name_ar: lang == 'ar' ? formData.model.sponsorName : '',
            family_number: formData.model.familyNumber,
            family_doc_number: formData.model.edbarahNumber,
            language: formData.model.selectedLanguage
        };

        return {
            contact_address: {
                area: formData.model.area,
                building: formData.model.building,
                mobile: formData.model.mobile,
                email: formData.model.email,
                emirate: formData.model.selectedEmirate
            },
            name: nameDetails,
            personal_profile: personal_profile
        }
    }

    this.getRentModel = function (formData) {
        var boxInfo = JSON.parse(formData.model.selectedBox);
        var lang = window.mypoboxtables.mypoboxInfo.lang;
        var nameDetails = {
            english: {
                first: lang == 'en' ? formData.model.firstName : '',
                last: lang == 'en' ? formData.model.lastName : '',
                full: lang == 'en' ? formData.model.firstName + ' ' + formData.model.lastName : ''
            },
            arabic: {
                first: lang == 'ar' ? formData.model.firstName : '',
                last: lang == 'ar' ? formData.model.lastName : '',
                full: lang == 'ar' ? formData.model.firstName + ' ' + formData.model.lastName : ''
            }
        };

        var requestorNameDetails = {};
        if (formData.requestorType == 'LBL_AGENT') {
            requestorNameDetails = {
                english: {
                    first: lang == 'en' ? formData.model.agent.firstName : '',
                    last: lang == 'en' ? formData.model.agent.lastName : '',
                    full: lang == 'en' ? formData.model.agent.firstName + ' ' + formData.model.agent.lastName : ''
                },
                arabic: {
                    first: lang == 'ar' ? formData.model.agent.firstName : '',
                    last: lang == 'ar' ? formData.model.agent.lastName : '',
                    full: lang == 'ar' ? formData.model.agent.firstName + ' ' + formData.model.agent.lastName : ''
                }
            };
        }

        var personal_profile = {
            eida: formData.model.emiratesId,
            eida_expiry_date: formData.model.emirtesIdExpiryDate != null ? formData.model.emirtesIdExpiryDate.getDateFormatForDM() : null,
            nationality: formData.model.selectedNationality != null ? formData.model.selectedNationality.id : null,
            passport_number: formData.model.passportNo,
            passport_issue_date: formData.model.passportIssueDate != null ? formData.model.passportIssueDate.getDateFormatForDM() : null,
            passport_expiry_date: formData.model.passportExpiryDate != null ? formData.model.passportExpiryDate.getDateFormatForDM() : null,
            area: formData.model.area,
            mobile: formData.model.mobile,
            email: formData.model.email,
            language: formData.model.selectedLanguage != null ? formData.model.selectedLanguage.id : null,
            trade_license_number: formData.model.tradeLicenseNumber,
            trade_license_issue_date: formData.model.tradeLicenseIssueDate != null ? formData.model.tradeLicenseIssueDate.getDateFormatForDM() : null,
            trade_license_expiry_date: formData.model.tradeLicenseExpiryDate != null ? formData.model.tradeLicenseExpiryDate.getDateFormatForDM() : null,
            trade_license_city: formData.model.tradeLicenseIssuePlace,
            sponsor_name_en: lang == 'en' ? formData.model.sponsorName : '',
            sponsor_name_ar: lang == 'ar' ? formData.model.sponsorName : '',
            family_number: formData.model.familyNumber,
            family_doc_number: formData.model.edbarahNumber
        };

        var requestorPersonal_profile = {};
        if (formData.requestorType == 'LBL_AGENT') {
            requestorPersonal_profile.language = formData.model.agent.selectedLanguage != null ? formData.model.agent.selectedLanguage.id : null;
            requestorPersonal_profile.nationality = formData.model.agent.selectedNationality != null ? formData.model.agent.selectedNationality.id : null;
        }

        return {
            rent_type: formData.selectedBundle.rent_type,
            txn_location: "WEB",
            transaction_type: "RENTAL",
            login_name: formData.model.loginName,
            account_id: formData.customerDetails != null ? formData.customerDetails.pkid : null,
            contact_address: {
                area: formData.model.area,
                building: formData.model.building,
                mobile: formData.model.mobile,
                email: formData.model.email
            },
            business_address: {
                area: formData.model.area,
                building: formData.model.building,
                mobile: formData.model.mobile,
                email: formData.model.email
            },
            box: {
                box_id: boxInfo.id,
                box_number: boxInfo.box_number,
                emirate_id: boxInfo.emirate_id,
                area_type: boxInfo.area_type,
                area_id: boxInfo.area_id
            },
            owner: {
                name: nameDetails,
                company_name: formData.model.companyName,
                contact_address: {
                    area: formData.model.area,
                    mobile: formData.model.mobile,
                    email: formData.model.email
                },
                business_address: {
                    area: formData.model.area,
                    mobile: formData.model.mobile,
                    email: formData.model.email
                },
                personal_profile: personal_profile
            },
            requestor: {
                name: formData.requestorType == 'LBL_AGENT' ? requestorNameDetails : nameDetails,
                company_name: formData.model.companyName,
                contact_address: {
                    area: formData.model.area,
                    mobile: formData.model.mobile,
                    email: formData.model.email
                },
                business_address: {
                    area: formData.model.area,
                    mobile: formData.model.mobile,
                    email: formData.model.email
                },
                personal_profile: formData.requestorType == 'LBL_AGENT' ? requestorPersonal_profile : personal_profile
            },
            agents: [],
            trade_licenses: [{
                trade_license_number: formData.model.tradeLicenseNumber,
                trade_license_issue_date: formData.model.tradeLicenseIssueDate != null ? formData.model.tradeLicenseIssueDate.getDateFormatForDM() : null,
                trade_license_expiry_date: formData.model.tradeLicenseExpiryDate != null ? formData.model.tradeLicenseExpiryDate.getDateFormatForDM() : null,
                trade_license_city: formData.model.tradeLicenseIssuePlace,
            }],
            order: getOrderDetails(formData.rentDetails),
            end_year: new Date().getFullYear(),
            bundle_id: formData.selectedBundle.id
        }
    }

    this.getEmratesNameById = function (emiratesNo) {
        var emirates = this.getEmirates();
        var emiratesName = null;
        if (emiratesNo) {
            emirates.forEach(function (item, index) {
                if (item.id != 0 && item.id == emiratesNo) {
                    emiratesName = item.name;
                }
            });
        }
        return $filter("i18n")(emiratesName);
    }

    this.setCustomerDetails = function (model, boxInfo, emirateName) {
        var customer = window.mypoboxtables.customer_profile;
        var lang = window.mypoboxtables.mypoboxInfo.lang;
        model.firstName = lang == "en" ? customer.customerName.english.first : customer.customerName.arabic.first;
        model.lastName = lang == "en" ? customer.customerName.english.last : customer.customerName.arabic.last;
        model.customerName = lang == "en" ? customer.customerName.english.full : customer.customerName.arabic.full;
        model.email = customer.addressProfile.contact.email;
        model.mobile = customer.addressProfile.contact.mobile;
        model.landmark = customer.addressProfile.contact.landmark;
        model.building = customer.addressProfile.contact.building;
        model.area = customer.addressProfile.contact.area;
        model.poboxNumber = boxInfo.rent_box.box_number;
        model.contractType = boxInfo.rent_type == 'C' ? $filter("i18n")('BOX_CORPORATEBUNDLES') : $filter("i18n")('BOX_INDIVIDUALBUNDLES');
        model.emirate = boxInfo.rent_box.emirate_id;
        model.emirateName = emirateName;

        return model;
    }

    this.getBundles = function (list) {
        var options = [];
        for (let obj of list) {
            var bundleName = $filter("i18n")(obj.product_name);
            options.push(new option(bundleName, obj.service_code));
        }
        return options;
    }

    this.getDeliveryOffices = function (list) {
        var options = [];
        for (let obj of list) {
            options.push(new option(obj.name, obj.id));
        }
        return options;
    }

    this.getUpgradePartialTemplatesPath = function () {
        var basePath = this.getBasePath();
        return {
            upgradeOwnerDetails: basePath + "upgrade/shared/upgrade-owner-details.html",
            upgradePriceList: basePath + "upgrade/shared/upgrade-price-list.html",
            upgradeTotalPaymentDetails: basePath + "upgrade/shared/upgrade-payment-details.html",
            mapCordinateTooltip: basePath + "partials/google-tooltip.html",
            upgradePaymentInfo: basePath + "upgrade/shared/upgrade-payinfo.html",
            upgraeTermsAndConditionPDF: this.getBaseStaticPath() + "MY_HOME_AGREEMENT.pdf"
        };
    }

    this.getTemplateConfig = function (type) {
        var type = (type == undefined) ? 'P' : type;
        let rentServiceId = '',
            renewServiceId = '',
            upgradeServiceId = '';
        if (WEBPACK_MODE !== 'dev') {
            rentServiceId = 'POBOX-RENT-' + type;
            renewServiceId = 'TEST_POBOX-RENEW-' + type;
            upgradeServiceId = 'TEST_POBOX-UPGRADE-' + type;
        } else {
            rentServiceId = 'TEST_POBOX-RENT-' + type;
            renewServiceId = 'TEST_POBOX-RENEW-' + type;
            upgradeServiceId = 'TEST_POBOX-UPGRADE-' + type;
        }
        return {
            surveyUrl: this.getBasePath() + 'partials/postal-delivery.html',
            navUrl: this.getBasePath() + 'partials/mybox-nav.html',
            tradeLicenseUrl: this.getBasePath() + 'partials/trade-license-info.html',
            attachmentUrl: this.getBasePath() + 'rent/shared/rent-attachments.html',
            companyInfoUrl: this.getBasePath() + 'rent/shared/company-info.html',
            onlineAccountInfoUrl: this.getBasePath() + 'rent/shared/online-account-info.html',
            fileUploadUrl: this.getBasePath() + 'rent/shared/file-upload.html',
            tabFormUrl: this.getBasePath() + 'partials/train-template.html',
            paymentInfoUrl: this.getBasePath() + 'partials/payment-info.html',
            billingInfoUrl: this.getBasePath() + 'partials/billing-info.html',
            rentServiceId: rentServiceId,
            renewServiceId: renewServiceId,
            upgradeServiceId: upgradeServiceId
        };
    }

    this.getRentPartialContentPath = function () {

        var baseTemplatePath = this.getBasePath();
        var _postBoxSelection = baseTemplatePath + 'rent/shared/rent-pobox-selection.html';
        var _ownerInformation = baseTemplatePath + 'rent/shared/rent-owner-info.html';
        var _rateInfo = baseTemplatePath + 'rent/shared/rent-rate-info.html';
        var _submit = baseTemplatePath + 'rent/shared/rent-submit.html';

        var id_postboxselection = {
            previousButtonClick: 'cancel',
            previousButtonParams: '',
            nextButtonClick: '',
            previousButtonName: 'BTN_CANCEL',
            nextButtonName: 'BTN_NEXT',
            submitButtonNextTabId: 'id_pobox_rent-tab-2'
        };

        var id_ownerInformation = {
            previousButtonClick: 'tabChange',
            previousButtonParams: 'id_pobox_rent-tab-1',
            nextButtonClick: '',
            previousButtonName: 'BTN_PREVIOUS',
            nextButtonName: 'BTN_NEXT',
            submitButtonNextTabId: 'id_pobox_rent-tab-3'
        };

        var id_rateInfo = {
            previousButtonClick: 'tabChange',
            previousButtonParams: 'id_pobox_rent-tab-2',
            nextButtonClick: 'rentPostBox',
            previousButtonName: 'BTN_PREVIOUS',
            nextButtonName: 'BTN_PAY',
            submitButtonNextTabId: ''
        };

        // var id_submit = {
        //     previousButtonClick: 'tabChange',
        //     previousButtonParams: 'id_pobox_rent-tab-3',
        //     nextButtonClick: 'rentPostBox',
        //     previousButtonName: 'BTN_PREVIOUS',
        //     nextButtonName: 'BTN_PAY',
        //     submitButtonNextTabId: ''
        // };

        var rentPartialContent = [];
        rentPartialContent.push(getTemplateObj('active', '#id_postboxselection',
            'id_pobox_rent-tab-1', 1, 'PNLHDR_BOXSELECTION', '',
            _postBoxSelection, 'id_postboxselection', true, id_postboxselection));

        rentPartialContent.push(getTemplateObj('', '#id_ownerInformation',
            'id_pobox_rent-tab-2', 2, 'PNLHDR_BOXOWNER', '',
            _ownerInformation, 'id_ownerInformation', '', id_ownerInformation));

        rentPartialContent.push(getTemplateObj('', '#id_rateInfo',
            'id_pobox_rent-tab-3', 3, 'TXT_SERVICE', '',
            _rateInfo, 'id_rateInfo', '', id_rateInfo));

        // rentPartialContent.push(getTemplateObj('', '#id_submit',
        //     'id_pobox_rent-tab-4', 4, 'HDR_REVIEWORDER', '',
        //     _submit, 'id_submit', '', id_submit));

        return rentPartialContent;
    }

    this.getRenewPartialContentPath = function () {

        var baseTemplatePath = this.getBasePath();
        var _ownerInformation = baseTemplatePath + 'renew/shared/renew-owner-information.html';
        var _rateInfo = baseTemplatePath + 'renew/shared/renew-rate-info.html';
        var _submit = baseTemplatePath + 'renew/shared/renew-submit.html';

        var renewPartialContent = [];

        var id_rateInfo = {
            previousButtonClick: '',
            previousButtonParams: '',
            nextButtonClick: '',
            previousButtonName: '',
            nextButtonName: 'BTN_NEXT',
            submitButtonNextTabId: 'id_pobox_renew-tab-2'
        };

        var id_ownerInformation = {
            previousButtonClick: 'tabChange',
            previousButtonParams: 'id_pobox_renew-tab-1',
            nextButtonClick: 'renewPostBox',
            previousButtonName: 'BTN_PREVIOUS',
            nextButtonName: 'BTN_PAY',
            submitButtonNextTabId: ''
        };

        // var id_submit = {
        //     previousButtonClick: 'tabChange',
        //     previousButtonParams: 'id_pobox_renew-tab-2',
        //     nextButtonClick: 'renewPostBox',
        //     previousButtonName: 'BTN_PREVIOUS',
        //     nextButtonName: 'BTN_PAY',
        //     submitButtonNextTabId: ''
        // };

        renewPartialContent.push(getTemplateObj('active', '#id_rateInfo',
            'id_pobox_renew-tab-1', 1, 'TXT_SERVICE', 'TXT_POSTBOX_SERVICE_DETAILS',
            _rateInfo, 'id_rateInfo', true, id_rateInfo));

        renewPartialContent.push(getTemplateObj('', '#id_ownerInformation',
            'id_pobox_renew-tab-2', 2, 'PNLHDR_BOXOWNER', 'TXT_CUSTOMER_INFORMATION',
            _ownerInformation, 'id_ownerInformation', '', id_ownerInformation));

        // renewPartialContent.push(getTemplateObj('', '#id_submit',
        //     'id_pobox_renew-tab-3', 3, 'HDR_REVIEWORDER', 'TXT_CONFIRM_DETAILS',
        //     _submit, 'id_submit', '', id_submit));

        return renewPartialContent;
    }

    this.getFileAttachmentTypes = function () {
        return {
            noc: new getFileModel('NOC'),
            passport: new getFileModel('PASSPORT'),
            emiratesId: new getFileModel('EMIRATESID'),
            familyBook: new getFileModel('FAMILYBOOK'),
            tradeLicense: new getFileModel('TRADELICENSE')
        };
    }

    this.getAllowedAdditionalServices = function () {
        var options = [];
        options.push(new option("0", "0"));
        options.push(new option("1", "1"));
        options.push(new option("2", "2"));
        options.push(new option("3", "3"));
        options.push(new option("4", "4"));
        options.push(new option("5", "5"));
        return options;
    }

    this.getEmirates = function () {
        var options = [];
        options.push(new option("LBL_ABUDHABI", "1"));
        options.push(new option("LBL_AJMAN", "4"));
        options.push(new option("LBL_DUBAI", "2"));
        options.push(new option("LBL_FUJAIRAH", "7"));
        options.push(new option("LBL_RASALKHAIMAH", "6"));
        options.push(new option("LBL_SHARJAH", "3"));
        options.push(new option("LBL_UMMALQAIWAIN", "5"));
        return options;
    }

    function getOrderDetails(model) {
        var orderDetails = [];
        var total_amount = 0;
        for (let item of model) {
            if (item.is_selected || item.criteria === 'M') {
                total_amount += (item.amount + item.vat);
                orderDetails.push({
                    service_id: item.service_id,
                    service_code: item.service_code,
                    amount: item.amount,
                    tax_amount: item.vat,
                    criteria: item.criteria,
                    quantity: item.quantity,
                    taxes: [{
                        amount: item.vat,
                        percentage: item.vatpercent,
                    }],
                    is_selected: item.is_selected,
                    total: item.amount + item.vat
                });
            }
        }
        return {
            total_amount: total_amount,
            service_details: orderDetails
        }
    }

    function getFormattedData(val) {
        if (val == '-' || val == ' ' || val == '' || val == null || val == undefined || val == [] || val == {}) {
            return '';
        } else {
            return val;
        }
    }

    function getFileModel(docType) {
        return {
            id: '',
            filename: '',
            docType: docType,
            size: '',
            uploaded: '',
            invalidMsg: '',
            maxSizeMsg: ''
        }
    }

    function getTemplateObj(active, href, tabHeaderId, step, title, description, template, contentId, isValidationSectionVisible, panelGeneral) {
        return {
            tabHeaderSection: new getTabHeaderSection(active, href, tabHeaderId, step, title, description),
            tabContentSection: new getTabContentSection(template, step, contentId, isValidationSectionVisible, active),
            tabGeneral: panelGeneral != undefined ? new gettabGeneral(panelGeneral) : {}
        };
    }

    function gettabGeneral(panelGeneral) {
        this.previousButtonClick = panelGeneral.previousButtonClick;
        this.previousButtonParams = panelGeneral.previousButtonParams;
        this.nextButtonClick = panelGeneral.nextButtonClick;
        this.previousButtonName = panelGeneral.previousButtonName;
        this.nextButtonName = panelGeneral.nextButtonName;
        this.submitButtonNextTabId = panelGeneral.submitButtonNextTabId;
    }

    function getTabContentSection(template, step, id, isValidationSectionVisible, active) {
        this.template = template;
        this.step = step;
        this.id = id;
        this.isValidationSectionVisible = isValidationSectionVisible;
        this.active = active;
    }

    function getTabHeaderSection(active, href, id, step, title, description) {
        this.active = active;
        this.href = href;
        this.id = id;
        this.step = step;
        this.title = title;
        this.description = description;
    }

    function option(key, value) {
        this.name = key;
        this.id = value;
    };
}