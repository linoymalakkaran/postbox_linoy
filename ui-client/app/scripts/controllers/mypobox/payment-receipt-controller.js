export default function PaymentReceiptController($scope, $timeout, $rootScope,
  toaster, $q, mypoboxFactory, formHelper, $filter, $stateParams, $cookieStore) {

  $scope.moment = moment;
  $scope.backbutton = true;
  debugger;
  let _cookie = $cookieStore.get('mypoboxInfo');
  if (_cookie.route === 'payment' && _cookie.paymentid != null) {
    $('#topNav').hide();
    $scope.backbutton = false;
    $stateParams.payment_id = _cookie.paymentid;
    $stateParams.previous_view = false;
  } else {
    $scope.previous_view = $stateParams.previous_view;
  }

  $scope.orders = [];
  $scope.contract = {};
  $scope.total_amount = 0;
  $scope.payment = {};

  $scope.print_mode = false;

  $scope.order_details_rows = {};
  $scope.customer = $rootScope.customer_personalprofile;
  $scope.customer_contact = $rootScope.customer_contact;

  $scope.init = function () {
    mypoboxFactory.getPaymentDetails.get({
      payment_pkid: $stateParams.payment_id
    }).$promise.then(function (response) {
      debugger;
      console.log(response);
      $scope.payment = response.data;
      const add = (a, b) => a.total_amount + b.total_amount;
      $scope.total_amount = $scope.payment.order_details.map(el => el.total_amount).reduce(add);
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

  $scope.init();

  $scope.expandCollapseOrderDetails = function (order_id) {
    $scope.order_details_rows[order_id] = !$scope.order_details_rows[order_id];
    $('.' + order_id).collapse('toggle');
  };

  $scope.printReceipt = function () {
    $scope.print_mode = true;
    $timeout(function () {
      window.print();
      $timeout(function () {
        $scope.print_mode = false;
      }, 10);
    }, 10);
  };
}