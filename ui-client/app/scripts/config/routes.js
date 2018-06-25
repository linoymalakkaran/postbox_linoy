export default function AppRouter($locationProvider, $urlRouterProvider, $stateProvider) {
  'use strict';

  let poboxTemplateUrl = 'mypostbox/public/views/mypobox/mypobox.html',
    errorTemplateUrl = 'mypostbox/mypostbox/public/views/404.html',
    rentboxTemplateUrl = 'mypostbox/public/views/rent/rent-pobox.html',
    orderHistoryTemplateUrl = 'mypostbox/public/views/mypobox/order-history.html',
    paymentHistoryTemplateUrl = 'mypostbox/public/views/mypobox/payment-history.html',
    orderDetailsTemplateUrl = 'mypostbox/public/views/mypobox/order-details.html',
    paymentReceiptTemplateUrl = 'mypostbox/public/views/mypobox/payment-receipt.html',
    paymentCheckoutTemplateUrl = 'mypostbox/public/views/mypobox/payment-checkout.html',
    poboxUpgradeTemplateUrl = 'mypostbox/public/views/upgrade/pobox-upgrade.html',
    upgradeOrderConfirmationTemplateUrl = 'mypostbox/public/views/upgrade/upgrade-order-confirmation.html',
    train_ar_css_url = 'mypostbox/public/static/train_ar.css',
    poboxRenewTemplateUrl = 'mypostbox/public/views/renew/renew-pobox.html',
    renewConfirmTemplateUrl = 'mypostbox/public/views/renew/renew-order-confirmation.html',
    poboxRentBundleUrl = 'mypostbox/public/views/rent/rent-pobox-bundle.html',
    rentboxLandingTemplateUrl = 'mypostbox/public/views/rent/rent-pobox-landing.html',
    invalidTemplateUrl = 'mypostbox/public/views/partials/invalid.html';

  if (WEBPACK_MODE === 'dev') {
    poboxTemplateUrl = 'views/mypobox/mypobox.html';
    errorTemplateUrl = 'views/404.html';
    rentboxTemplateUrl = 'views/rent/rent-pobox.html';
    orderHistoryTemplateUrl = 'views/mypobox/order-history.html';
    paymentHistoryTemplateUrl = 'views/mypobox/payment-history.html';
    orderDetailsTemplateUrl = 'views/mypobox/order-details.html';
    paymentReceiptTemplateUrl = 'views/mypobox/payment-receipt.html';
    paymentCheckoutTemplateUrl = 'views/mypobox/payment-checkout.html';
    poboxUpgradeTemplateUrl = 'views/upgrade/pobox-upgrade.html';
    upgradeOrderConfirmationTemplateUrl = 'views/upgrade/upgrade-order-confirmation.html';
    train_ar_css_url = 'static/train_ar.css';
    poboxRenewTemplateUrl = 'views/renew/renew-pobox.html';
    renewConfirmTemplateUrl = 'views/renew/renew-order-confirmation.html';
    poboxRentBundleUrl = 'views/rent/rent-pobox-bundle.html';
    rentboxLandingTemplateUrl = 'views/rent/rent-pobox-landing.html';
    invalidTemplateUrl = 'views/partials/invalid.html';
  }

  $locationProvider.hashPrefix('');
  //$urlRouterProvider.otherwise('/mypobox');

  $stateProvider
    .state('error', {
      name: 'Error',
      url: '/error',
      templateUrl: errorTemplateUrl
    })
    .state('mypobox', {
      name: 'MyPoBox',
      url: '/mypobox',
      templateUrl: poboxTemplateUrl
    })
    .state('order_history', {
      name: 'Order History',
      url: '/order_history',
      templateUrl: orderHistoryTemplateUrl
    })
    .state('payment_history', {
      name: 'Payment History',
      url: '/payment_history',
      templateUrl: paymentHistoryTemplateUrl
    })
    .state('order_details', {
      name: 'Order Details',
      url: '/order_details/:order_pkid',
      templateUrl: orderDetailsTemplateUrl
    })
    .state('payment_receipt', {
      name: 'Payment Receipt',
      url: '/payment_receipt/:previous_view/:payment_id',
      templateUrl: paymentReceiptTemplateUrl
    })
    .state('payment_receipt_direct', {
      name: 'Payment Receipt',
      url: '/payment_receipt',
      templateUrl: paymentReceiptTemplateUrl
    })
    .state('payment_checkout', {
      name: 'Payment Checkout',
      url: '/payment_checkout',
      templateUrl: paymentCheckoutTemplateUrl
    })
    .state('pobox-upgrade', {
      name: 'pobox Upgrade',
      url: '/pobox-upgrade',
      templateUrl: poboxUpgradeTemplateUrl
    }).state('pobox-upgrade-order-confirm', {
      name: 'pobox Upgrade Confirmation',
      url: '/pobox-upgrade-order-confirm',
      templateUrl: upgradeOrderConfirmationTemplateUrl
    }).state('pobox-renew', {
      name: 'pobox Renew',
      url: '/pobox-renew',
      templateUrl: poboxRenewTemplateUrl
    }).state('pobox-renew-confirm', {
      name: 'pobox Renew Confirmation',
      url: '/pobox-renew-confirm',
      templateUrl: renewConfirmTemplateUrl
    }).state('pobox-rent-bundle', {
      name: 'pobox Rent Bundle',
      url: '/pobox-rent-bundle',
      templateUrl: poboxRentBundleUrl
    }).state('pobox-rent', {
      name: 'Rent P.O. Box',
      url: '/pobox-rent-pobox',
      templateUrl: rentboxTemplateUrl
    }).state('rent-pobox-landing', {
      name: 'Rent Landing',
      url: '/rent-pobox-landing',
      templateUrl: rentboxLandingTemplateUrl
    }).state('invalid', {
      name: 'Invalid',
      url: '/invalid',
      templateUrl: invalidTemplateUrl
    });
};