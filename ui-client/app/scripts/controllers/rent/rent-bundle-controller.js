export default function rentBundleController($scope, rentFactory, cfpLoadingBar, $state, $timeout, $rootScope) {
    'use strict';

    $scope.init = function () {

        rentFactory.getRentBundleDetails.get({
            lang: window.mypoboxtables.mypoboxInfo.lang,
            contract_type: window.mypoboxtables.mypoboxInfo.contractType
        }).$promise.then(function (response) {
            console.log(response);
            if (response.status_code === 200 && response.status_message.toLowerCase() === 'ok') {
                $timeout(function () {
                    $scope.$apply(function () {
                        $rootScope.load.translationsloaded = true;
                    });
                }, 1);
                $scope.bundles = response.data.bundles.map(
                    function (bundle) {
                        return new Bundle(bundle).asViewModel();
                    }
                );
                window.mypoboxtables.resources = {};
                window.mypoboxtables.resources.productTranslationMessages =
                    response.data.productTranslationMessages;
                window.mypoboxtables.resources.uiTranslationMessages =
                    response.data.uiTranslationMessages;
            }
        }, function (err) {
            cfpLoadingBar.complete();
            console.log(err);
        });
    }

    $scope.apply = function (bundle) {
        $rootScope.bundle = bundle;
        $rootScope.contractType = window.mypoboxtables.mypoboxInfo.bundleType;
        $state.go('pobox-rent');
    };

    $scope.init();
}

function Bundle(bundle) {
    this.bundle = bundle;
};

Bundle.prototype.asViewModel = function () {
    switch (this.bundle.id) {
        case 'IN':
            this.bundle.key_bundleid = 'MYBOX';
            break;
        case 'MYZONE':
            this.bundle.key_bundleid = 'MYZONE';
            break;
        case 'MYHOME3':
            this.bundle.key_bundleid = 'MYHOME';
            break;
        case 'MYHOME6':
            this.bundle.key_bundleid = 'MYHOME';
            break;
        case 'MYBUILDING':
            this.bundle.key_bundleid = 'MYBLDG';
            break;
        case 'LI':
            this.bundle.key_bundleid = 'COMPLITE';
            break;
        case 'ST':
            this.bundle.key_bundleid = 'COMPSTD';
            break;
        case 'BR':
            this.bundle.key_bundleid = 'EZIBRONZE';
            break;
        case 'SI':
            this.bundle.key_bundleid = 'EZISILVER';
            break;
        case 'GO':
            this.bundle.key_bundleid = 'EZIGOLD';
            break;
        default:
            this.bundle.key_bundleid = this.bundle.code;
    }
    return this.bundle;
};