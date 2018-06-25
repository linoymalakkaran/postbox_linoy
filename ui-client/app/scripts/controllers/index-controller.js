export default function indexCtrl($scope, $cookieStore, $rootScope, $transitions,
    $timeout, $q, toaster, mypoboxFactory, formHelper, $state) {
    'use strict';

    $scope.translationsloaded = false;
    let _cookie = $cookieStore.get('mypoboxInfo');
    $scope.return_url = '';
    $scope.payment_url = '';
    $scope.timestamp = (new Date()).getTime();

    $scope.current_route = window.location.hash.substring(2);
    $scope.assignRoute = function (route) {
        $timeout(function () {
            $scope.$apply(function () {
                $scope.current_route = route;
            });
        }, 1);
    };

    $rootScope.$on('change_view', function (event, view_name) {
        $scope.assignRoute(view_name);
    });

    if (WEBPACK_MODE === 'dev') {
        $cookieStore.put('mypoboxInfo', {
            lang: 'en',
            accountPkId: '323128',
            //route: 'rentlanding',
            //route: 'rent',
            route: 'mypobox',
            //contractType: 'C' //'P'  
        });
    }

    mypoboxFactory.getUiConfig.get().$promise.then(function (res) {
        let result = res.data;
        $scope.return_url = result.payment_handler_url; //PAYMENT_RETURN_URL;
        $scope.payment_url = result.payment_form_url; //PAYMENT_FORM_URL;
    });

    $scope.init = function () {
        $rootScope.load = {
            translationsloaded: false
        };
        $rootScope.config = formHelper.getTemplateConfig();
        window.mypoboxtables = {};
        window.mypoboxtables.mypoboxInfo = $cookieStore.get('mypoboxInfo');
        $rootScope.direction = window.mypoboxtables.mypoboxInfo.lang === 'en' ? 'ltr' : 'rtl';
        if (window.mypoboxtables.mypoboxInfo.route === 'mypobox') {
            $state.go('mypobox');
        } else if (window.mypoboxtables.mypoboxInfo.route === 'rent') {
            $state.go('pobox-rent-bundle');
        } else if (window.mypoboxtables.mypoboxInfo.route === 'rentlanding') {
            window.mypoboxtables.resources = {
                uiTranslationMessages: {}
            };
            $state.go('rent-pobox-landing');
        }
    }

    $scope.payNow = function () {
        $('#non-paybable-countries-message').modal();
        $timeout(function () {
            $scope.payNow_Final();
        }, 5000);
    };

    $scope.payNow_Final = function () {
        var order_pkids = getOrderPkids();
        mypoboxFactory.getTxnNumber.save({
            amount_to_pay: $scope.cart.total_amount,
            comma_delimited_order_pkids: order_pkids
        }).$promise.then(function (res) {
            debugger;
            console.log('RES', res);
            if (res.status_code == 200 && res.status_message === 'Ok') {
                $('#payment-form').attr('action', $scope.payment_url);
                $scope.return_url += '/' + _cookie.accountPkId;
                $scope.txn_ref = res.data.txn_number;
                $('#TXN_REF').val($scope.txn_ref);
                $('#RETURN_URL').val($scope.return_url);
                $('#payment-form').submit();
            } else {
                toaster.pop({
                    type: 'error',
                    title: 'Error occured',
                    body: res.data_msg_desc,
                    timeout: 3000
                });
            }
        }, function (err) {
            console.log("ERROR", err);
            toaster.pop({
                type: 'error',
                title: 'Error occured',
                body: 'Server responded with error.',
                timeout: 3000
            });
        });
    };

    function getOrderPkids() {
        var orderIds = [];
        for (var key in $scope.cart.orders) {
            if ($scope.cart.orders.hasOwnProperty(key)) {
                orderIds.push($scope.cart.orders[key].order_number);
            }
        }
        return orderIds.join(',');
    }

    $scope.init();
}