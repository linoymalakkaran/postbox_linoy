export default function PaymentHistoryController($scope, $timeout, $rootScope,
  toaster, $q, mypoboxFactory, formHelper, $filter, $cookieStore) {

  $scope.moment = moment;

  $scope.payment_history = [];

  $scope.request_status = '';

  $scope.init = function () {
    $scope.request_status = 'IN_PROGRESS';
    let _cookie = $cookieStore.get('mypoboxInfo');
    mypoboxFactory.getPaymentHistory.get({
      //accountPkId: _cookie.accountPkId
    }).$promise.then(function (response) {
      console.log(response);
      $scope.request_status = 'DONE';
      if (response.data) {
        $scope.payment_history = response.data.payments;
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

}