export default function PaymentCheckoutController($scope, $timeout, $rootScope,
  toaster, $q, mypoboxFactory, formHelper, $filter, $stateParams, $cookieStore) {

  $scope.backbutton = true;
  $scope.order_details_expand = true;

  $scope.moment = moment;

  $scope.order_history = [];
  $scope.payment_history = [];

  // Check for these two with Jojy
  //$scope.cc = "4000000000000002 / DEC2016 / 5200000000000007 /DEC2018";
  $scope.txn_ref = ''; //"ORD40";

  $scope.err_payment_message = '';
  $scope.success_payment_message = '';

  $scope.getSearchParamsAsObject = function () {
    if (window.location.toString().indexOf('?') !== -1) {
      var search = window.location.toString().split('?')[1];
      return (
        JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"')
          .replace(/&/g, '","').replace(/=/g, '":"') + '"}')
      );
    } else {
      return undefined;
    }
  };

  $scope.loadOrders = function () {
    $q.all([
      mypoboxFactory.getPaymentHistory.get({
        //accountPkId: _cookie.accountPkId
      }).$promise,
      mypoboxFactory.getOrderHistory.get({
        //accountPkId: _cookie.accountPkId
      }).$promise
    ]).then(function (response) {
      console.log(response);
      if (response && response.length > 0) {
        if (response[0].data) {
          $scope.payment_history = response[0].data.payments;
        }
        if (response[1].data) {
          $scope.order_history = response[1].data.orders;
        }
        $scope.order_history.forEach((d) => {
          $scope.payment_history.forEach((pd) => {
            if (d.payment_pkid && d.payment_pkid === pd.pkid) {
              d.transaction_number = pd.transaction_number;
              d.payment_ref_identifier = pd.payment_ref_identifier;
              d.payment_date = pd.payment_date;
            }
          })
        });
      }
    }, function (err) {
      console.log(err);
      toaster.pop({
        type: 'error',
        title: 'Error occured',
        body: 'Server responded with error.',
        timeout: 3000
      });
    });
  };

  $scope.loadPaymentResult = function () {
    var _params = $scope.getSearchParamsAsObject();
    if (typeof _params !== 'undefined') {
      mypoboxFactory.getPaymentResult.save(_params)
        .$promise.then(function (res) {
          console.log('RES', res);
          if (res['data_msg_title'] === "GENERAL.ERR_MSG_TITLE") {
            // error
            $timeout(function () {
              $scope.$apply(function () {
                $scope.err_payment_message = res['data_msg_title'];
              });
            }, 10);
          } else {
            // success
            $timeout(function () {
              $scope.$apply(function () {
                $scope.success_payment_message = 'Success';
              });
            }, 10);
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
    }
  };

  $scope.init = function () {
    $scope.loadPaymentResult();
    $scope.loadOrders();
  };

  $scope.init();

  $scope.removeFromCart = function (orderId) {
    $timeout(function () {
      $scope.$apply(function () {
        if (window.mypoboxtables.cart.count) {
          window.mypoboxtables.cart.count -= 1;
          window.mypoboxtables.cart.total_amount -= +window.mypoboxtables.cart.orders[orderId].charge_amount;
          delete window.mypoboxtables.cart.orders[orderId];
        }
      });
    }, 10);

  };

  $scope.addToCart = function (order) {
    console.log(order);
    $timeout(function () {
      $scope.$apply(function () {
        window.mypoboxtables.cart.count += 1;
        order.index = window.mypoboxtables.cart.count;
        window.mypoboxtables.cart.total_amount += +order.charge_amount;
        window.mypoboxtables.cart.orders[order.pkid] = order;
      });
    }, 10);
  };

  $scope.orderDetailsExpandCollapse = function () {
    $timeout(function () {
      $scope.$apply(function () {
        $scope.order_details_expand = !$scope.order_details_expand;
      });
    }, 1);
  };


  $scope.isNotInCart = function (order) {
    return !window.mypoboxtables.cart.orders[order.pkid];
  };

  $scope.isNotPaid = function (order) {
    return (order.order_status === 'NOT PAID');
  };

  $scope.hasOrdersForPayment = function () {
    return (
      $scope.order_history
      .filter($scope.isNotPaid)
      .filter($scope.isNotInCart)
      .length
    );
  }


};