export default function OrderHistoryController($scope, $timeout, $rootScope,
  toaster, $q, mypoboxFactory, formHelper, $filter, $cookieStore) {

  $scope.moment = moment;

  $scope.order_history = [];
  $scope.payment_history = [];

  $scope.request_status = '';

  $scope.cart = window.mypoboxtables.cart;

  $scope.init = function () {
    let _cookie = $cookieStore.get('mypoboxInfo');
    $scope.request_status = 'IN_PROGRESS';
    $q.all([
      mypoboxFactory.getPaymentHistory.get({
      }).$promise,
      mypoboxFactory.getOrderHistory.get({
      }).$promise
    ]).then(function (response) {
      console.log(response);
      $scope.request_status = 'DONE';
      if (response && response.length > 0) {
        if (response[0].data) {
          $scope.payment_history = response[0].data.payments;
        }
        if (response[1].data) {
          $scope.order_history = response[1].data.orders;
        }
      }
    }, function (err) {
      console.log(err);
      $scope.request_status = 'DONE';
      toaster.pop({
        type: 'error',
        title: 'Error occured',
        body: 'Server responded with error.',
        timeout: 3000
      });
    });

  };

  $scope.init();

  $scope.removeFromCart = function (orderId) {
    $timeout(function () {
      $scope.$apply(function () {
        if (window.mypoboxtables.cart.count && window.mypoboxtables.cart.orders[orderId]) {
          window.mypoboxtables.cart.count -= 1;
          window.mypoboxtables.cart.total_amount -= +window.mypoboxtables.cart.orders[orderId].charge_amount;
          delete window.mypoboxtables.cart.orders[orderId];
        }
      });
    }, 10);

  };

  $scope.addToCart = function (order) {
    $timeout(function () {
      $scope.$apply(function () {
        window.mypoboxtables.cart.count += 1;
        order.index = window.mypoboxtables.cart.count;
        window.mypoboxtables.cart.total_amount += +order.charge_amount;
        window.mypoboxtables.cart.orders[order.pkid] = order;
      });
    }, 10);
  };

  $scope.cancelOrder = function (orderId) {
    $scope.removeFromCart(orderId);
    mypoboxFactory.cancelOrder.get({ order_id: orderId })
      .$promise.then(function (response) {
        console.log(response);
        $scope.init();
      });
  };
}