export default function OrderDetailsController($scope, $state, $timeout, $rootScope,
  toaster, $q, mypoboxFactory, formHelper, $filter, $stateParams, $cookieStore) {

  $scope.moment = moment;

  $scope.backbutton = true;

  $scope.order = {};

  $scope.cart = window.mypoboxtables.cart;

  $scope.init = function () {
    let _cookie = $cookieStore.get('mypoboxInfo');
    mypoboxFactory.getOrderDetails.get({
      order_id: $stateParams.order_pkid
    })
      .$promise.then(function (response) {
        debugger;
        console.log(response);
        $scope.order = response.data.order;
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

  $scope.removeFromCart = function (orderId) {
    $timeout(function () {
      $scope.$apply(function () {
        window.mypoboxtables.cart.count -= 1;
        window.mypoboxtables.cart.total_amount -= +window.mypoboxtables.cart.orders[orderId].charge_amount;
        delete window.mypoboxtables.cart.orders[orderId];
      });
    }, 10);

  };

  $scope.addToCart = function () {
    $timeout(function () {
      $scope.$apply(function () {
        window.mypoboxtables.cart.count += 1;
        $scope.order.index = window.mypoboxtables.cart.count;
        window.mypoboxtables.cart.total_amount += +$scope.order.charge_amount;
        window.mypoboxtables.cart.orders[$scope.order.pkid] = $scope.order;
      });
    }, 10);
  };

  $scope.init();

}