var isProduction = process.env.NODE_ENV !== "development";
var extend = require('extend');

var defaultApiConfig = {
    customer: {
        baseUrl: 'http://intranet/staging/svc_customermanagement/rs/',
        customerProfileUpdateUrl: 'customer_profile/{0}/update_profile',
        customerRegistrationDetailUrl: '/admin/customer_registration/loginID/{0}',
        loginUrl: 'customer_profile/login/',
        logoutUrl: 'customer_profile/{0}/logout/',
        isLoggedinUrl: 'admin/is_loggedin/?customerPKID={0}',
        updatePasswordUrl: 'customer_profile/{0}/update_password/',
        customerInfoUrl: 'customer_profile/{0}/info/',
        createPoBoxAccountUrl: 'admin/create_pbox_account/',
        createLoginUrl: 'admin/create_login/',
        registerCustomerUrl: 'admin/register_customer/',
        smartregisterCustomerUrl: 'admin/smartregister_customer/',
        forgotPasswordUrl: 'admin/forgot_creds/',
        emailCredentialsUrl: 'admin/{0}/email_creds',
        accountValidUrl: 'admin/is_accountvalid',
        isPOBoxCustomerValidUrl: 'admin/is_pbox_customervalid/',
        usernameAvailableUrl: 'admin/is_uname_available',
        submitRegistrationUrl: 'admin/register_customer',
        linkPOBoxUrl: 'admin/attach_pobox_to_loginaccount',
        unlinkPOBoxUrl: 'admin/dettach_pobox_from_loginaccount',
        smartPassCustomerInfoUrl: 'customer_profile/{0}/spass',
        onlineServiceAuthenticateHandler: 'http://intranet/svcweb/usermanagement/authenticateuser.ashx'
    },
    pobox: {
        baseUrl: 'http://intranet/staging/svc_postbox/rs/pbox/',
        rentUrl: 'box/{0}/rentbox',
        sendRentBookingEmailUrl: 'order/{0}/email',
        renewUrl: 'box/{0}/renewbox',
        formUploadUrl: 'box/{0}/forms/{1}/upload',
        duesUrl: 'boxes/{0}/dues',
        previousDuesUrl: 'boxes/{0}/previous_dues',
        areasInEmirateUrl: 'city/{0}/loctype/{1}/freeboxareas/',
        boxInAreaUrl: 'city/{0}/loctype/{1}/location/{2}/freeboxes',
        contractsByAccountIdUrl: 'accounts/{0}/contracts',
        contractDetailsUrl: 'contract/{0}',
        ordersUrl: 'accounts/{0}/orders',
        orderDetailsUrl: 'orders/{0}',
        paymentsUrl: 'accounts/{0}/payments',
        paymentDetailsUrl: 'payment/{0}',
        prepare3dsPaymentUrl: 'prepare3dspayment',
        result3dsPaymentUrl: '3dspaymentresult',
        productRentalPriceUrl: 'products/{0}/rentalprice?duration={1}&quantity={2}&boxPKID={3}',
        bundlePriceUrl: 'bundles/{0}/contracttypes/{1}/durations/{2}/pricing',
        cancelOrder: 'order/{0}/cancel'
    },
    translation: {
        baseUrl: 'http://intranet/svc_general/rs/translation/',
        entityUrl: 'entity/{0}/{1}', //langID,entity_type
        entityDetailsByIdUrl: 'entity/{0}/{1}/{2}', //langID,entity_type,id
        uiTranslationsUrl: 'ui/{0}/{1}' //langID,contextType=BOX
    },
    infra: {
        baseUrl: 'http://intranet/api_infra/',
        oAuthUrl: 'oauth/token',
        temporaryfileUploadUrl: 'filedb/t0/store',
        temporaryfileViewUrl: 'filedb/t0/view?fileid_s={0}'
    },
    postboxpos: {
        baseUrl: 'http://intranet/test/svc_postbox_pos/rs/',
        upgradablePoBoxDetailsUrl: 'pbox/{0}/emirate/{1}/upgrade_details', //box_number,emirate_id
        upgradePoBoxUrl: 'pbox/{0}/upgrade', //box_id
        getDeliveryOfficesUrl: 'lookup/emirate/{0}/post_offices', //emirate_id
        boxInfo: 'pbox/{0}/info', //box_id
        duesUrl: 'pbox/{0}/renting_for_years/{1}/dues', //box_id,renting_for_years
        poboxByCustomerNumber: 'pbox/list_by_customer_numbers',
        productRentalPriceUrl: 'bundle/{0}/service/{1}/rent_type/{2}/order_type/{3}/end_year/{4}/quantity/{5}/pricing', //bundle_id,service_id,rent_type,order_type,end_year,quantity
        areasInEmirateUrl: 'bundle/{0}/emirate/{1}/freebox_areas', //bundle_id,emirate_id
        boxInAreaUrl: 'bundle/{0}/emirate/{1}/area/{2}/freeboxes', //bundle_id,emirate_id,area_id
        contractsByAccountIdUrl: 'account/{0}/poboxes', //account_id
        preparePaymentUrl: 'payment/prepare',
        paymentResultUrl: 'payment/process',
        bundleListUrl: 'bundle/list',
        renewUrl: 'pbox/{0}/renew',
        rentUrl: 'pbox/{0}/rent',
        ordersUrl: 'account/{0}/orders',
        orderDetailsUrl: 'order/{0}',
        paymentsUrl: 'account/{0}/payments',
        paymentDetailsUrl: 'payment/{0}',
        PaymentInfoWithOrderDetailsUrl: 'payment/{0}/payment_id/{1}/account_id',
        hold: 'pbox/{0}/hold',
        unhold: 'pbox/{0}/unhold',
        validateTokenUrl: 'payment/validate_receipt_token',
        sendPaymentNotificationUrl: 'payment/notify'
    },
    postBoxsurvey: {
        baseUrl: 'http://localhost:52631/rs/survey/',
        save: 'save'
    }
};

if (isProduction) {
    var prodApiConfig = require('../config/production/api-config');
    extend(true, defaultApiConfig, prodApiConfig);
} else {
    var devApiConfig = require('../config/development/api-config');
    extend(true, defaultApiConfig, devApiConfig);
}

module.exports = defaultApiConfig;