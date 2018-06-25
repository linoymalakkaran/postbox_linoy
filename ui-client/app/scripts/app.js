/**
 * @ngdoc overview
 * @name EPG.MYPOBOX.APP
 * @description
 * # EPG.MYPOBOX.APP
 *
 * Main module of the application.
 */
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../../node_modules/angular-loading-bar/build/loading-bar.css';
import '../../node_modules/angularjs-toaster/toaster.css';
import '../../node_modules/angularjs-datepicker/dist/angular-datepicker.css';
import '../pobox-fonts/styles.css';

import '../styles/print.css';
import '../styles/app.css';
import '../styles/main.css';
import '../styles/media.css';

import extensions from './lib/extensions'
import AppRouter from './config/routes';
import {
  numbersOnly,
  formInput,
  tabForm
} from './directives/mypobox-directive';
import i18n from './filters/mypobox-filter';
import mypoboxFactory from './factories/mypobox-factory';
import renewFactory from './factories/renew-factory';
import rentFactory from './factories/rent-factory';
import formHelper from './services/mypobox-service';
import navCtrl from './controllers/mypobox/nav-controller';
import indexCtrl from './controllers/index-controller';
import mypoboxCtrl from './controllers/mypobox/mypobox-controller';
import OrderHistoryController from './controllers/mypobox/order-history-controller';
import PaymentHistoryController from './controllers/mypobox/payment-history-controller';
import PaymentReceiptController from './controllers/mypobox/payment-receipt-controller';
import OrderDetailsController from './controllers/mypobox/order-details-controller';
import PaymentCheckoutController from './controllers/mypobox/payment-checkout-controller';
import PoboxUpgradeController from './controllers/upgrade/pobox-upgrade-controller';
import RenewController from './controllers/renew/renew-controller';
import RentBundleController from './controllers/rent/rent-bundle-controller';
import rentLandingController from './controllers/rent/rent-landing-controller';
import rentController from './controllers/rent/rent-controller';
import invalidController from './controllers/invalid-controller';

const MODULE_NAME = 'EPG.MYPOBOX.APP';

let _module = angular.module(MODULE_NAME, ['ui.router', 'ngResource',
  'angular-loading-bar', 'toaster', 'ngCookies', '720kb.datepicker', 'ngFileUpload', 'ngAnimate'
]).config(['$locationProvider', '$urlRouterProvider', '$stateProvider', AppRouter])
  .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) { }]);
if (WEBPACK_MODE !== 'build') {
  _module.config(function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
  });
}

_module
  .constant('ngAuthSettings', {
    apiServiceBaseUri: API_URL
  })
  .directive('numbersOnly',
    numbersOnly)
  .directive('formInput', ['formHelper',
    formInput])
  .directive('tabForm', ['formHelper',
    tabForm])
  .filter('i18n', ['$filter',
    i18n])
  .factory('mypoboxFactory', ['$resource', 'ngAuthSettings',
    mypoboxFactory])
  .factory('renewFactory', ['$resource', 'ngAuthSettings',
    renewFactory])
  .factory('rentFactory', ['$resource', '$q', 'Upload', 'ngAuthSettings',
    rentFactory])
  .service('formHelper', ['$rootScope', '$sce', '$filter', 'toaster',
    formHelper])
  .controller('navCtrl', ['$rootScope', '$scope', '$timeout',
    navCtrl])
  .controller('indexCtrl', ['$scope', '$cookieStore', '$rootScope',
    '$transitions', '$timeout', '$q', 'toaster', 'mypoboxFactory', 'formHelper', '$state',
    indexCtrl
  ])
  .controller('mypoboxCtrl', ['$scope', '$state', '$timeout', '$rootScope', 'toaster',
    '$q', 'mypoboxFactory', 'formHelper', '$filter', '$cookieStore',
    mypoboxCtrl
  ])
  .controller('OrderHistoryController', ['$scope', '$timeout', '$rootScope', 'toaster',
    '$q', 'mypoboxFactory', 'formHelper', '$filter', '$cookieStore',
    OrderHistoryController
  ])
  .controller('PaymentHistoryController', ['$scope', '$timeout', '$rootScope', 'toaster',
    '$q', 'mypoboxFactory', 'formHelper', '$filter', '$cookieStore',
    PaymentHistoryController
  ])
  .controller('PaymentReceiptController', ['$scope', '$timeout', '$rootScope', 'toaster',
    '$q', 'mypoboxFactory', 'formHelper', '$filter', '$stateParams', '$cookieStore',
    PaymentReceiptController
  ])
  .controller('OrderDetailsController', ['$scope', '$state', '$timeout', '$rootScope', 'toaster',
    '$q', 'mypoboxFactory', 'formHelper', '$filter', '$stateParams', '$cookieStore',
    OrderDetailsController
  ])
  .controller('PoboxUpgradeController', ['$scope', '$timeout', '$rootScope', 'toaster',
    '$q', 'mypoboxFactory', 'formHelper', '$filter', '$stateParams', '$state',
    PoboxUpgradeController
  ])
  .controller('PaymentCheckoutController', ['$scope', '$timeout', '$rootScope',
    'toaster', '$q', 'mypoboxFactory', 'formHelper', '$filter', '$stateParams', '$cookieStore',
    PaymentCheckoutController
  ])
  .controller('RenewController', ['$scope', '$timeout', '$rootScope',
    'toaster', 'mypoboxFactory', 'renewFactory', 'formHelper', '$filter', '$stateParams', '$state', 'cfpLoadingBar',
    RenewController
  ])
  .controller('rentBundleController', ['$scope', 'rentFactory', 'cfpLoadingBar', '$state', '$timeout', '$rootScope',
    RentBundleController
  ])
  .controller('rentLandingController', ['$scope', '$state', '$timeout', '$rootScope',
    rentLandingController
  ]).controller('rentController', ['$scope', '$timeout', '$rootScope',
    'toaster', 'mypoboxFactory', 'rentFactory', 'formHelper', '$filter', '$stateParams',
    '$state', 'cfpLoadingBar', 'ngAuthSettings',
    rentController
  ]).controller('invalidController', ['$scope', '$state', '$rootScope',
    invalidController
  ]);


export default MODULE_NAME;