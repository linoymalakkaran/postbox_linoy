export default function rentLandingController($scope, $state, $timeout, $rootScope) {
    'use strict';

    $scope.init = function () {

        $timeout(function () {
            $scope.$apply(function () {
                $rootScope.load.translationsloaded = true;
            });
        }, 10);
    }

    $scope.reDirectToRent = function (type) {
        window.mypoboxtables.mypoboxInfo.contractType = type;
        window.mypoboxtables.mypoboxInfo.route = 'rent';
        $state.go('pobox-rent-bundle');
    };

    $scope.init();
}