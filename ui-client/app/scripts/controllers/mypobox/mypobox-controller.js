export default function MyPOBoxCtrl($scope, $state, $timeout, $rootScope,
  toaster, $q, mypoboxFactory, formHelper, $filter, $cookieStore) {

  $scope.moment = moment;
  $scope.formHelper = formHelper;

  $scope.backbutton = false;

  $scope.request_status = '';

  $scope.poboxes = [];

  $scope.init = function () {
    $scope.myboxInit();
    let _cookie = $cookieStore.get('mypoboxInfo');
    if (_cookie.route === 'payment' && _cookie.paymentid != null) {
      $scope.switchView('payment_receipt_direct');
    }
    $scope.request_status = 'IN_PROGRESS';
    mypoboxFactory.getContractsByAccountId.get({
      lang: _cookie.lang
    })
      .$promise.then(function (response) {
        console.log(response);
        $scope.request_status = 'DONE';
        if (response && response.data && response.data.length > 0) {
          $scope.poboxes = response.data.map(function (d) {
            d.rent_box.box_number = 0 | d.rent_box.box_number;
            return d;
          });
        }
      }, function (err) {
        $scope.request_status = 'DONE';
        console.log(err);
        toaster.pop({
          type: 'error',
          title: 'Error occured',
          body: 'Server responded with error.',
          timeout: 3000
        });
      });
  };

  $scope.myboxInit = function () {
    window.mypoboxtables.cart = {
      count: 0,
      orders: {},
      total_amount: 0
    };
    $scope.cart = window.mypoboxtables.cart;
    $q.all([
      mypoboxFactory.getApplicationFormData
        .get({
          lang: window.mypoboxtables.mypoboxInfo.lang
        }).$promise,
      mypoboxFactory.getCustomerDetails
        .get({}).$promise
    ]).then(function (data) {
      console.log(data);
      window.mypoboxtables.resources = {};
      window.mypoboxtables.resources.productTranslationMessages =
        data[0].data.productTranslationMessages;
      window.mypoboxtables.resources.uiTranslationMessages =
        data[0].data.uiTranslationMessages;
      window.mypoboxtables.customer_profile = data[1].data;
      $rootScope.customer_contact = window.mypoboxtables.customer_profile.addressProfile.contact;
      $rootScope.customer_personalprofile = window.mypoboxtables.customer_profile.personalProfile;
      $rootScope.customer_name = window.mypoboxtables.customer_profile.customerName;
      $timeout(function () {
        $rootScope.$apply(function () {
          $rootScope.load.translationsloaded = true;
        });
      }, 1);
    },
      function (err) {
        console.log(err);
      });
  };

  $scope.switchView = function (view_name) {
    $state.go(view_name);
    $rootScope.$emit('change_view', view_name);
  };

  $scope.redirectToUpgrade = function (view_name, pobox) {
    $rootScope.upgradeBoxInfo = pobox;
    $state.go(view_name);
  }


  $scope.redirectToRenew = function (pobox) {
    $rootScope.upgradeBoxInfo = pobox;
    $state.go('pobox-renew');
  };

  $scope.init();

}