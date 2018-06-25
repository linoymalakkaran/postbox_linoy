export default function PoboxUpgradeController($scope, $timeout, $rootScope,
    toaster, $q, mypoboxFactory, formHelper, $filter, $stateParams, $state) {

    $scope.moment = moment;
    $scope.backbutton = false;
    $scope.previous_view = $stateParams.previous_view;
    $scope.isRenewable = false;
    $scope.isUpgradeSectionvisible = false;
    $scope.upgradeConfirmation = false;
    $scope.notConfirmationPage = true;
    $scope.model = {};
    $scope.toolTip = {
        showMapToolTip: false
    };

    $scope.init = function () {
        $scope.template = formHelper.getUpgradePartialTemplatesPath();
        $scope.boxInfo = $rootScope.upgradeBoxInfo;
        $scope.isRenewable = $scope.boxInfo.renewable;
        var emirate = formHelper.getEmratesNameById($scope.boxInfo.rent_box.emirate_id);
        $scope.model = formHelper.setCustomerDetails($scope.model, $scope.boxInfo, emirate);
        $scope.model.sameAsContactAddress = false;
        $scope.emiratesList = formHelper.getEmirates();

        mypoboxFactory.getUpgradablePoBoxDetails.get({
            pobox_id: $scope.boxInfo.rent_box.box_id,
            box_number: $scope.boxInfo.rent_box.box_number,
            emirate_id: $scope.boxInfo.rent_box.emirate_id,
            bundle_id: $scope.boxInfo.bundle_id,
            is_renwable: $scope.boxInfo.renewable,
            lang: window.mypoboxtables.mypoboxInfo.lang
        }).$promise.then(function (response) {
            console.log(response);
            $scope.renewDetails = response.data.renewPriceList.mandatoryServices;
            $scope.addtionalServices = response.data.renewPriceList.additionalServices;
            $scope.renewTotalPrice = 0;
            for (let obj of $scope.renewDetails) {
                $scope.renewTotalPrice += obj.amount + obj.vat;
            }
            $scope.upgradableDetails = response.data.upgradablePoboxDetails;
            $scope.bundles = formHelper.getBundles(response.data.upgradablePoboxDetails.bundles);
            $scope.deliveryOffices = formHelper.getDeliveryOffices(response.data.deliveryOffices);
            $scope.languages = response.data.languages;
            $scope.nationalities = response.data.nationalities;
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

    $scope.toggleBillingAddress = function () {
        debugger;
        if ($scope.model.sameAsContactAddress) {
            var data = formHelper.setBillingInfo($scope);
            //set for payment screen
            $rootScope.customer_contact = data.contact_address;
            $rootScope.customer_personalprofile = data.personal_profile;
            $rootScope.customer_name = data.name;
        } else {
            $rootScope.customer_contact = {};
            $rootScope.customer_personalprofile = {};
            $rootScope.customer_name = {};
        }
    };

    $scope.getTotalVatForRenew = function () {
        var renewVatTotalPrice = 0;
        if ($scope.renewDetails) {
            for (var i = 0; i < $scope.renewDetails.length; i++) {
                renewVatTotalPrice += $scope.renewDetails[i].vat;
            }
        }
        return renewVatTotalPrice;
    };

    $scope.getTotalVatForUpgrade = function () {
        var upgradeVatTotalPrice = 0;
        if ($scope.upgradableDetails && $scope.upgradableDetails.bundles) {
            for (var i = 0; i < $scope.upgradableDetails.bundles.length; i++) {
                upgradeVatTotalPrice += $scope.upgradableDetails.bundles[i].vat;
            }
        }
        return upgradeVatTotalPrice;
    };

    $scope.setUpgradeDetails = function () {
        $scope.setRateTable();
        $scope.isBundleSelected = $scope.model.selectedBundle == null ? false : true;
    };

    $scope.setRateTable = function () {
        if (!$scope.model.selectedBundle) {
            $scope.isBundleSelected = false;
            return false;
        }
        var bundle = $scope.model.selectedBundle;
        var bundleDetails = $filter('filter')($scope.upgradableDetails.bundles, {
            service_code: bundle.id
        }, true);
        $scope.upgradePriceList = bundleDetails;
        $scope.upgradeTotalPrice = bundleDetails[0].is_taxable ? bundleDetails[0].amount + bundleDetails[0].vat : bundleDetails[0].amount;
        $scope.totalPrice = $scope.renewTotalPrice + $scope.upgradeTotalPrice;
    };

    $scope.rateInfoTotal = function (val1, val2) {
        return parseFloat(val1) + parseFloat(val2);
    };

    $scope.UpgradePoboxConfirm = function (form) {
        $scope.upgradeConfirmation = false;
        if (!formHelper.validateForm(form)) {
            return;
        } else {
            $scope.upgradeConfirmation = true;
        }

        var data = formHelper.createUpgradeModel($scope, $scope.boxInfo);
        var upgradePostBoxResource = new mypoboxFactory.upgradePoBox();
        window.upgrade = {};
        window.upgrade.upgradeBoxInfo = {
            isRenewable: $scope.isRenewable,
            upgradePriceList: $scope.upgradePriceList,
            renewDetails: $scope.renewDetails,
            upgradeTotalPrice: $scope.upgradeTotalPrice,
            renewTotalPrice: $scope.renewTotalPrice,
            totalPrice: $scope.totalPrice,
            customerInfo: {
                name: $scope.model.customerName,
                paidStatus: $filter("i18n")('TXT_NOT_PAID'),
                emirate: $scope.model.emirate
            },
            box: $scope.boxInfo.rent_box
        };
        upgradePostBoxResource.formData = data;
        upgradePostBoxResource.lang = window.mypoboxtables.mypoboxInfo.lang;
        upgradePostBoxResource.$query().then(function (response) {
            console.log(response);
            if (response.status_code === 200 && response.status_message === 'Ok') {
                $rootScope.orderDetails = response.data;
                $scope.showFeedback(response.data, data);
                $scope.pay();
            } else {
                toaster.pop('error', 'Error', response.data_msg_desc);
            }
        }, function (error) {
            toaster.pop('error', 'Error', error.data_msg_desc);
        });
    };

    $scope.showFeedback = function (result, customerData) {
        var serviceId = $scope.config.upgradeServiceId;
        try {
            var experienceJSON = {
                serviceID: serviceId,
                customerJSON: {
                    name: customerData.owner.name.english.full,
                    mobile: customerData.owner.contact_address.mobile,
                    email: customerData.owner.contact_address.email,
                    userName: result.customer_loginid,
                    orderNumber: result.order_number
                }
            };
            window.experienceJSON = experienceJSON;
            //showfeedback_dialog(experienceJSON);
        } catch (ex) { }
    };

    $scope.UpgradePobox = function (form) {
        $scope.upgradeConfirmation = false;
        if (!formHelper.validateForm(form)) {
            return;
        } else {
            $scope.UpgradePoboxConfirm(form);
        }
    };

    $scope.GPSRequired = function (key) {
        if ($scope.model.makani || $scope.model[key]) {
            return false;
        } else {
            return true;
        }
    };

    $scope.MakaniRequired = function () {
        if ($scope.model.gpsX || $scope.model.gpsY) {
            return false;
        } else {
            return true;
        }
    };

    $scope.pay = function () {
        $rootScope.cart = getOrderDetails();
        $scope.payNow_Final();
        // $('#non-paybable-countries-message').modal();
        // $timeout(function () {
        //     $scope.$apply(function () {
        //         $rootScope.cart = getOrderDetails();
        //     });
        // }, 10);
    };

    function getOrderDetails() {
        var orderObj = {
            count: 0,
            orders: {},
            total_amount: 0
        };
        var orderDetails = {};
        var index = 0;
        var boxPkid = window.upgrade.upgradeBoxInfo.box.box_id;
        if ($scope.isRenewable) {
            index++;
            var renewOrderNo = $rootScope.orderDetails.renew_order_number;
            orderDetails['id_' + index] = {
                order_date: new Date(),
                order_status: "NOT PAID",
                pkid: boxPkid,
                order_number: renewOrderNo,
                order_type: "RENEW",
                remarks: "RENEW",
                charge_amount: window.upgrade.upgradeBoxInfo.renewTotalPrice,
                index: index
            }
        }
        index++;
        var upgradeOrderNo = $rootScope.orderDetails.upgrade_order_number;
        orderDetails['id_' + index] = {
            order_date: new Date(),
            order_status: "NOT PAID",
            pkid: boxPkid,
            order_number: upgradeOrderNo,
            order_type: "UPGRADE",
            remarks: "NOT PAID",
            charge_amount: window.upgrade.upgradeBoxInfo.upgradeTotalPrice,
            index: index
        }
        orderObj.count = index;
        orderObj.orders = orderDetails;
        orderObj.total_amount = window.upgrade.upgradeBoxInfo.totalPrice;
        return orderObj;
    }

    $scope.init();

}