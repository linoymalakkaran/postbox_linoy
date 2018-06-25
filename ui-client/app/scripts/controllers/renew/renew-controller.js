export default function RenewController($scope, $timeout, $rootScope,
    toaster, mypoboxFactory, renewFactory, formHelper, $filter, $stateParams, $state, cfpLoadingBar) {

    $scope.init = function () {
        var d = new Date();
        $scope.yesterday = new Date(d.setDate(d.getDate() - 1));
        $scope.tommorrow = new Date(d.setDate(d.getDate() + 1));
        $scope.deliveryOnDemandNotSubmited = true;
        $scope.model = {};
        $scope.postalDelivery = {};
        $scope.allowedNumbers = [0, 1, 2, 3, 4, 5];
        $scope.getFormData();
        $scope.emiratesList = formHelper.getEmirates();
    };

    $scope.getFormData = function () {
        $scope.pageSections = formHelper.getRenewPartialContentPath();
        $scope.boxInfo = $rootScope.upgradeBoxInfo;
        $scope.contractType = $scope.boxInfo.rent_type;
        var emirate = formHelper.getEmratesNameById($scope.boxInfo.rent_box.emirate_id);
        $scope.model = formHelper.setCustomerDetails($scope.model, $scope.boxInfo, emirate);

        renewFactory.getRenewablePoBoxDetails.get({
            pobox_id: $scope.boxInfo.rent_box.box_id,
            box_number: $scope.boxInfo.rent_box.box_number,
            emirate_id: $scope.boxInfo.rent_box.emirate_id,
            bundle_id: $scope.boxInfo.bundle_id,
            lang: window.mypoboxtables.mypoboxInfo.lang || 'en'
        }).$promise.then(function (response) {
            console.log(response);
            $scope.renewDetails = response.data.renewPriceList.mandatoryServices;
            $scope.addtionalServices = response.data.renewPriceList.additionalServices;
            $scope.renewTotalPrice = 0;
            for (let obj of $scope.renewDetails) {
                $scope.renewTotalPrice += obj.amount + obj.vat;
            }
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

    $scope.enableAdditionalService = function (item) {
        item.is_selected = item.quantity === 0 ? false : true;
        item.text = item.is_selected ? $filter("i18n")('BTN_YES') : $filter("i18n")('VAL_NO');
        $scope.addOrRemoveService(item);
    };

    //add or remove order services
    $scope.addOrRemoveService = function (item) {
        if (item.is_selected) {
            $scope.addAdditionalService(item);
        } else {
            //remove from order details
            var index = $scope.renewDetails.indexOf(item);
            $scope.renewDetails.splice(index, 1);
            $scope.setTotalPrice();
        }
    };

    $scope.addAdditionalService = function (item) {
        var data = {
            bundle_code: $scope.boxInfo.bundle_id,
            product_id: item.service_id,
            product_code: item.service_code,
            duration: new Date().getFullYear(),
            quantity: item.quantity,
            contract_type: $scope.contractType,
            lang: window.mypoboxtables.mypoboxInfo.lang || 'en',
            order_type: 'RENEW',
        };
        mypoboxFactory.getProductPrice.get(data).$promise.then(function (response) {
            if (response.status_code === 200 && response.status_message === 'Ok') {
                item.amount = response.data.price;
                item.unit_price = parseFloat(item.amount) / parseFloat(item.quantity);
                item.vat = response.data.vat;
                item.vatpercent = response.data.vatpercent;
                $scope.addIntoOrderDetails(item);
            } else {
                if (item.addAdditionalService) {
                    item.is_selected = !item.is_selected;
                    item.text = item.is_selected ? $filter("i18n")('BTN_YES') : $filter("i18n")('VAL_NO');
                    item.quantity = item.is_selected ? 1 : 0;
                }
                console.log('account Info: Customer details not found...!');
            }
        }, function (err) {
            item.is_selected = !item.is_selected;
            item.text = item.is_selected ? $filter("i18n")('BTN_YES') : $filter("i18n")('VAL_NO');
            item.quantity = item.is_selected ? 1 : 0;
            cfpLoadingBar.complete();
            console.log('account Info: Error", "Server is down...! please try again later.');
        });
    };

    $scope.addIntoOrderDetails = function (item) {
        var data = $filter('filter')($scope.renewDetails, {
            'service_code': item.service_code,
            'isAdditionalService': true
        }, true);
        if (data && data[0]) {
            var index = $scope.renewDetails.indexOf(data[0]);
            $scope.renewDetails.splice(index, 1);
        }
        $scope.renewDetails.push(item);
        $scope.setTotalPrice();
    };

    $scope.deliveryOnDemandFeedBack = function () {
        $scope.deliveryOnDemandNotSubmited = false;
    };

    $scope.resetSurveyStyle = function () {
        $scope.surveyColor = {
            "color": "#67B2D8"
        };
    }

    $scope.setTotalPrice = function () {
        var total = 0;
        for (var i = 0; i < $scope.renewDetails.length; i++) {
            total = parseFloat(total + parseFloat($scope.renewDetails[i].amount) + parseFloat($scope.renewDetails[i].vat));
        }
        $scope.renewTotalPrice = total;
    };

    $scope.renewPostBox = function () {
        if ($scope.postalDelivery.status === undefined) {
            var surveyMsg = $filter("i18n")('MSG_SURVEY_ERROR');
            $scope.surveyColor = {
                "color": "red"
            };
            toaster.pop('error', 'Error', surveyMsg);
            window.parent.postMessage('{"scroll":"true","topx":"0","topy":"425"}', "*");
            return;
        }

        if ($scope.renewTotalPrice < 100) {
            return;
        }

        var data = formHelper.getRenewModel($scope, $scope.boxInfo);
        data.is_home_delivery_selected = $scope.postalDelivery.status;
        var renewPostBoxResource = new renewFactory.renewPoBox();
        renewPostBoxResource.formData = data;
        renewPostBoxResource.$query().then(function (response) {
            if (response.status_code === 200 && response.status_message === 'Ok') {
                $scope.showFeedback(response.data, data);
                if (response.data) {
                    $rootScope.orderDetails = response.data;
                    $scope.pay();
                } else {
                    var msg = $filter("i18n")(response.data_msg_desc);
                    toaster.pop('error', 'Error', msg);
                }
            } else {
                toaster.pop('error', 'Error', response.data_msg_desc);
            }
        }, function (error) {
            cfpLoadingBar.complete();
            toaster.pop('error', 'Error', error.data_msg_desc);
        });
    };

    $scope.pay = function () {
        $rootScope.cart = getOrderDetails();
        $scope.payNow_Final();
        //$('#non-paybable-countries-message').modal();
        // $scope.payNow();
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
        var boxPkid = $scope.boxInfo.rent_box.box_id;
        var boxNumber = $scope.boxInfo.rent_box.box_number;
        var adminOffice = formHelper.getEmratesNameById($scope.boxInfo.rent_box.emirate_id);
        index++;
        var renewOrderNo = $rootScope.orderDetails.order_number;
        orderDetails['id_' + index] = {
            order_date: new Date(),
            order_status: "NOT PAID",
            pkid: boxPkid,
            box_number: 'PO Box Renewal: ' + boxNumber + ' ' + adminOffice,
            order_number: renewOrderNo,
            order_type: "RENEW",
            remarks: "RENEW",
            charge_amount: $scope.renewTotalPrice,
            index: index
        }
        orderObj.count = index;
        orderObj.orders = orderDetails;
        orderObj.total_amount = $scope.renewTotalPrice;
        return orderObj;
    }

    $scope.showFeedback = function (result, customerData) {
        var serviceId = $scope.config.renewServiceId;
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

    $scope.rateInfoTotal = function (val1, val2) {
        return parseFloat(val1) + parseFloat(val2);
    };

    $scope.FormTabSubmit = function (form, tabName, formName) {

        var formInfo = form[formName];
        if (formHelper.validateForm(formInfo)) {
            $scope.tabChange(tabName);
        } else {
            window.parent.postMessage('{"scroll":"true","topx":"0","topy":"425"}', "*");
        }
    };

    $scope.tabChange = function tabChange(tabName) {
        $('#' + tabName).tab('show');
        window.parent.postMessage('{"scroll":"true","topx":"0","topy":"425"}', "*");
    };

    $scope.init();
}