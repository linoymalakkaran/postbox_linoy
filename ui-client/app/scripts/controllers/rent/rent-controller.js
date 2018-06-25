export default function RentController($scope, $timeout, $rootScope,
    toaster, mypoboxFactory, rentFactory, formHelper, $filter, $stateParams, $state, cfpLoadingBar, ngAuthSettings) {
    $scope.init = function () {
        $scope.model = {};
        $scope.postalDelivery = { status: "NO" };
        $scope.attachments = formHelper.getFileAttachmentTypes();
        $scope.postalDelivery = {};
        $scope.allowedNumbers = [0, 1, 2, 3, 4, 5];
        $scope.allowedFileExtensions = ['doc', 'docx', 'pdf', 'jpeg', 'jpg', 'png'];
        $scope.userNameAvailabilityMessage = {};
        $scope.loginNameChange = false;
        $scope.pageSections = formHelper.getRentPartialContentPath();
        $scope.template = formHelper.getTemplateConfig();
        $scope.getFormData();
        $scope.setMadatoryAndAdditionalServices();
        $scope.emiratesList = formHelper.getEmirates();
        $scope.model.sameAsContactAddress = false;
    };

    $scope.getFormData = function () {
        $scope.contractType = window.mypoboxtables.mypoboxInfo.contractType;
        $scope.isCorporate = $scope.contractType === 'C';
        $scope.selectedBundle = $rootScope.bundle;
        $scope.lang = window.mypoboxtables.mypoboxInfo.lang;
        rentFactory.getRentDetails.get({
            lang: $scope.lang
        }).$promise.then(function (response) {
            console.log(response);
            if (response.data.pageData.isSmartPassLogin && response.data.missingFields.length > 0) {
                $rootScope.missingFileds = response.data.missingFields;
                $state.go('invalid-page');
            } else {
                $scope.emirates = response.data.emirates;
                if ($scope.bundle.id === 'MYHOME3' || $scope.bundle.id === 'MYHOME6') {
                    $scope.emirates = $scope.emirates.filter(c => {
                        if (c.id === '1' || c.id === '2') return c;
                    });
                }
                $scope.languages = response.data.languages;
                $scope.nationalities = response.data.nationalities;
                $scope.isSmartPassLogin = response.data.pageData.isSmartPassLogin;
                $scope.showAccountSegment = !response.data.pageData.isLoggedIn;
                $scope.customerDetails = response.data.customerDetails;
                formHelper.setRentModel($scope);
            }
        }, function (err) {
            console.log(err);
        });
    };

    $scope.setMadatoryAndAdditionalServices = function () {
        $scope.rentDetails = [];
        $scope.addtionalServices = [];
        $scope.selectedBundle.services.map(function (item) {
            var result = {
                isAdditionalService: item.criteria === 'A' ? true : false,
                criteria: item.criteria,
                service_id: item.service_id,
                service_code: item.service_code,
                product_name: $filter('i18n')(item.service_code),
                unit_price: item.unit_price,
                amount: item.amount,
                price_unit: "AED",
                quantity: item.quantity,
                is_selected: item.criteria === 'M' ? true : false,
                vat: item.is_taxable ? parseFloat(item.taxes[0].amount) : 0,
                vatpercent: item.is_taxable ? item.taxes[0].percentage : 0
            };
            if (item.criteria === "M") {
                $scope.rentDetails.push(result)
            } else if (item.criteria === "A") {
                $scope.addtionalServices.push(result)
            }
        });

        $scope.rentTotalPrice = 0;
        for (let obj of $scope.rentDetails) {
            $scope.rentTotalPrice += obj.amount + obj.vat;
        }
    };

    $scope.getFreeBoxAreasInEmirate = function () {
        $scope.noArea = false;
        var data = {
            emirate_id: $scope.model.selectedEmirate.id,
            lang: $scope.lang || 'en',
            bundle_id: $scope.selectedBundle.id,
            box_location_type: $scope.selectedBundle.location_type,
        };
        $scope.model.selectedArea = null;
        $scope.model.selectedBox = null;
        $scope.boxes = [];
        $scope.areas = [];
        rentFactory.getFreeBoxAreasInEmirate.get(data).$promise.then(function (response) {
            if (response.status_code === 200 && response.status_message === 'Ok') {
                if (response.data && response.data.areas && response.data.areas.length !== 0) {
                    $scope.areas = response.data.areas;
                } else {
                    $scope.noArea = true;
                }
            } else {
                var message = $filter("i18n")(response.data_msg_desc);
                console.log(response.data_msg_desc);
            }
        }, function (err) {
            cfpLoadingBar.complete();
            console.log(err);
        });
    };

    $scope.checkUserAvailability = async function () {
        if (!$scope.model.loginName) {
            var message = $filter("i18n")("ERR_MSG_ACCOUNTUSERNAMEMISSING");
            toaster.pop('error', "Error", message);
            window.parent.postMessage('{"scroll":"true","topx":"0","topy":"425"}', "*");
            return;
        }
        var data = {
            userName: $scope.model.loginName
        };
        var isAvailable = await checkUserAvailabilityAsync(data);
        $scope.userNameAvailabilityMessage = {
            msg: isAvailable ? 'INFO_USERID_AVAILABLE' : 'WARN_USERID_UNAVAILABLE',
            isAvailable: isAvailable
        };
        $scope.loginNameChange = true;
    };

    $scope.getBoxesInArea = function () {
        var selectedArea = angular.fromJson($scope.model.selectedArea);
        if (selectedArea && selectedArea.id) {
            $scope.noBox = false;
            var data = {
                emirate_id: $scope.model.selectedEmirate.id,
                area_id: selectedArea.id,
                bundle_id: $scope.selectedBundle.id
            };
            $scope.model.selectedBox = null;
            $scope.boxes = [];
            rentFactory.getBoxesInArea.get(data).$promise.then(function (response) {
                if (response.status_code === 200 && response.status_message === 'Ok') {
                    if (response.data && response.data.boxes && response.data.boxes.length !== 0) {
                        $scope.boxes = response.data.boxes;
                    } else {
                        $scope.noBox = true;
                    }
                } else {
                    var message = $filter("i18n")("ERR_MSG_WHILE_FETCHING_DATA");
                    window.parent.postMessage('{"scroll":"true","topx":"0","topy":"425"}', "*");
                }
            }, function (error) {
                cfpLoadingBar.complete();
                console.log(error);
            });
        }
    };

    $scope.cancel = function () {
        $state.go('pobox-rent-bundle');
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
            var index = $scope.rentDetails.indexOf(item);
            $scope.rentDetails.splice(index, 1);
            $scope.setTotalPrice();
        }
    };

    $scope.addAdditionalService = function (item) {
        var data = {
            bundle_code: $scope.selectedBundle.id,
            product_code: item.service_code,
            duration: new Date().getFullYear(),
            quantity: item.quantity,
            contract_type: $scope.contractType,
            order_type: 'NEW',
            lang: window.mypoboxtables.mypoboxInfo.lang || 'en'
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
        var data = $filter('filter')($scope.rentDetails, {
            'service_code': item.service_code,
            'isAdditionalService': true
        }, true);
        if (data && data[0]) {
            var index = $scope.rentDetails.indexOf(data[0]);
            $scope.rentDetails.splice(index, 1);
        }
        $scope.rentDetails.push(item);
        $scope.setTotalPrice();
    };

    $scope.setTotalPrice = function () {
        var total = 0;
        for (var i = 0; i < $scope.rentDetails.length; i++) {
            total = parseFloat(total + parseFloat($scope.rentDetails[i].amount) + parseFloat($scope.rentDetails[i].vat));
        }
        $scope.rentTotalPrice = total;
    };

    $scope.rentPostBox = function () {

        if ($scope.rentTotalPrice < 100) {
            return;
        }

        var data = formHelper.getRentModel($scope);
        //set for payment screen
        $rootScope.customer_contact = data.contact_address;
        $rootScope.customer_personalprofile = data.owner.personal_profile;
        $rootScope.customer_name = data.owner.name;

        $scope.rentRequestData = angular.copy(data);
        var rentPostBoxResource = new rentFactory.rentPoBox();
        rentPostBoxResource.formData = data;
        rentPostBoxResource.$query().then(function (response) {
            if (response.status_code === 200 && response.status_message === 'Ok') {
                $scope.showFeedback(response.data, $scope.rentRequestData);
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

    $scope.showFeedback = function (result, customerData) {
        var serviceId = $scope.config.rentServiceId;
        try {
            var experienceJSON = {
                serviceID: serviceId,
                customerJSON: {
                    name: customerData.owner.personal_profile.lang === 'en' ? customerData.owner.name.english.full : customerData.owner.name.arabic.full,
                    mobile: customerData.owner.personal_profile.mobile,
                    email: customerData.owner.personal_profile.email,
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

    $scope.uploadFile = function (file, model) {
        model.maxSizeMsg = '';
        model.invalidMsg = '';
        if (!file) {
            return false;
        }
        var sizeInMB = file.size / 1024 / 1024;
        if (sizeInMB > 2) {
            model.maxSizeMsg = $filter("i18n")('MAX_FILE_SIZE_EXCEED');
            return false;
        }

        var fileExtension = file.name.split('.')[1];
        if (fileExtension) {
            fileExtension = fileExtension.toLowerCase();
        }
        if (fileExtension && $.inArray(fileExtension, $scope.allowedFileExtensions) === -1) {
            model.invalidMsg = $filter("i18n")('INVALID_FILE_FORMAT');
            return false;
        }
        var documentInfo = {
            poboxNo: JSON.parse($scope.model.selectedBox).box_number,
            uploadedDateTime: moment(new Date()).format("DD/MM/YYYY"),
            docName: model.docType,
            emirate: $scope.model.selectedEmirate.name,
            docType: 'RENT'
        };
        rentFactory.uploadFile(file, documentInfo).then(function (response) {
            if (response.data && response.data.data_code && response.data.status_code === 200) {
                model.id = response.data.data.file_identifier;
                model.filename = file.name;
                model.size = parseInt(parseInt(file.size) / 1024);
                let serviceBase = ngAuthSettings.apiServiceBaseUri;
                let filePath = '/' + documentInfo.docType + '/' + documentInfo.docType.toUpperCase() + '/' + documentInfo.uploadedDateTime.replace(new RegExp('/', 'g'), '_') + '/' + documentInfo.poboxNo + '/';
                model.url = serviceBase + "pobox/viewFile?filePath=" + filePath + response.data.data.file_identifier;
                model.delete_url = serviceBase + "pobox/deleteFile?filePath=" + filePath + response.data.data.file_identifier;
                model.uploaded = true;
            } else {
                console.log('error while upload');
            }
        });
    };

    $scope.deleteFile = function (model) {
        model.uploaded = false;
        model.filename = "";
    };

    $scope.unHoldPoBox = function () {
        var data = {
            poboxNumber: Number(JSON.parse($scope.model.selectedBox).unique_box_number)
        };
        rentFactory.unHoldPoBox.get(data).$promise.then(function (response) {
            if (response.status_code === 200 && response.status_message === 'Ok') {
                console.log('Pobox unholded successfully.');
            } else {
                console.log('Pobox unholded failed.');
            }
        }, function (err) {
            cfpLoadingBar.complete();
            console.log(err);
        });
    };

    $scope.holdPobox = function (form, tabName) {
        $scope.boxInfo = JSON.parse($scope.model.selectedBox);
        var data = {
            poboxNumber: Number($scope.boxInfo.unique_box_number)
        };
        rentFactory.holdPoBox.get(data).$promise.then(function (response) {
            if (response.status_code === 200 && response.status_message === 'Ok') {
                if (formHelper.validateForm(form)) {
                    $scope.tabChange(tabName);
                } else {
                    toaster.pop('error', "Error", msg);
                    console.log(response);
                }
            } else {
                toaster.pop('PoBox not available');
                console.log(response);
            }
        }, function (err) {
            cfpLoadingBar.complete();
            toaster.pop('PoBox not available');
            console.log(err);
        });
    };

    $scope.FormTabSubmit = function (form, tabName, formName) {

        var formInfo = form[formName];
        var selectedBox = JSON.parse($scope.model.selectedBox);
        if (selectedBox && selectedBox.unique_box_number && tabName === 'id_pobox_rent-tab-2') {
            var data = {
                poboxNumber: Number(selectedBox.unique_box_number)
            };
            $scope.holdPobox(formInfo, tabName);
        } else {
            if (formHelper.validateForm(formInfo)) {
                $scope.tabChange(tabName);
            } else {
                window.parent.postMessage('{"scroll":"true","topx":"0","topy":"425"}', "*");
            }
        }
    };

    $scope.tabChange = async function tabChange(tabName) {

        if (tabName === 'id_pobox_rent-tab-3' && $scope.showAccountSegment) {
            var data = {
                userName: $scope.model.loginName
            };
            var isAvailable = await checkUserAvailabilityAsync(data);
            $scope.userNameAvailabilityMessage = {
                msg: isAvailable ? 'INFO_USERID_AVAILABLE' : 'WARN_USERID_UNAVAILABLE',
                isAvailable: isAvailable
            };
            $scope.loginNameChange = true;
            if (!isAvailable) {
                toaster.pop('error', "Error", $filter("i18n")($scope.userNameAvailabilityMessage.msg));
                return;
            } else {
                $('#' + tabName).tab('show');
                window.parent.postMessage('{"scroll":"true","topx":"0","topy":"425"}', "*");
            }
        } else {
            if (tabName === 'id_pobox_rent-tab-1') {
                $scope.unHoldPoBox();
            }
            $('#' + tabName).tab('show');
            window.parent.postMessage('{"scroll":"true","topx":"0","topy":"425"}', "*");
        }
    };

    async function checkUserAvailabilityAsync(data) {
        return new Promise(resolve => {
            rentFactory.checkUserNameAvailability.get(data).$promise.then(function (response) {
                if (response.status_code === 200 && response.status_message === 'Ok') {
                    resolve(response.data.isAvailable);
                } else {
                    resolve(false);
                    console.log('account Info: Customer details not found...!');
                }
            }, function (err) {
                cfpLoadingBar.complete();
                console.log('account Info: Error", "Server is down...! please try again later.');
                resolve(false);
            });
        });
    }

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
        var boxPkid = $scope.boxInfo.id;
        var boxNumber = $scope.boxInfo.box_number;
        var adminOffice = formHelper.getEmratesNameById($scope.boxInfo.emirate_id);
        index++;
        var rentOrderNo = $rootScope.orderDetails.order_number;
        orderDetails['id_' + index] = {
            order_date: new Date(),
            order_status: "NOT PAID",
            pkid: boxPkid,
            box_number: 'PO Box Rental: ' + boxNumber + ' ' + adminOffice,
            order_number: rentOrderNo,
            order_type: "RENT",
            remarks: "RENT",
            charge_amount: $scope.rentTotalPrice,
            index: index
        }
        orderObj.count = index;
        orderObj.orders = orderDetails;
        orderObj.total_amount = $scope.rentTotalPrice;
        return orderObj;
    }

    $scope.init();
}