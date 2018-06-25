export default function rentFactory($resource, $q, Upload, ngAuthSettings) {
    'use strict';
    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    return {
        getRentBundleDetails: $resource(serviceBase + 'rent/rentBundleDetails', {
            contract_type: '@contract_type',
            lang: '@lang'
        }, {
                get: {
                    method: 'GET',
                    transformResponse: function (response) {
                        return angular.fromJson(response);
                    },
                    isArray: false
                }
            }),

        getRentDetails: $resource(serviceBase + 'rent/rentDetails', {
            lang: '@lang'
        }, {
                get: {
                    method: 'GET',
                    transformResponse: function (response) {
                        return angular.fromJson(response);
                    },
                    isArray: false
                }
            }),

        rentPoBox: $resource(serviceBase + 'rent/rentBox', {}, {
            query: {
                method: 'POST',
                transformResponse: function (response, headers) {
                    return angular.fromJson(response);
                }
            },
            isArray: false
        }),

        getFreeBoxAreasInEmirate: $resource(serviceBase + 'rent/pobox/free-box-areas/emirate?emirate_id=:emirate_id&box_location_type=:box_location_type&lang=:lang', {
            emirate_id: '@emirate_id',
            box_location_type: '@box_location_type',
            lang: '@lang',
            bundle_id: '@bundle_id'
        }, {
                get: {
                    method: 'GET',
                    transformResponse: function (response) {
                        return angular.fromJson(response);
                    },
                    isArray: false
                }
            }),

        getBoxesInArea: $resource(serviceBase + 'rent/pobox/free-boxes/emirate?emirate_id=:emirate_id&box_location_type=:box_location_type&location_id=:location_id&lang=:lang', {
            emirate_id: '@emirate_id',
            area_id: '@area_id',
            bundle_id: '@bundle_id'
        }, {
                get: {
                    method: 'GET',
                    transformResponse: function (response) {
                        return angular.fromJson(response);
                    },
                    isArray: false
                }
            }),

        checkUserNameAvailability: $resource(serviceBase + 'customer/checkusernameavailability?userName=:userName&lang=:lang', {
            pkId: '@userName',
            lang: '@lang'
        }, {
                get: {
                    method: 'GET',
                    transformResponse: function (response) {
                        return angular.fromJson(response);
                    },
                    isArray: false
                }
            }),

        uploadFile: function (file, documentInfo) {
            var deferred = $q.defer();
            Upload.upload({
                url: serviceBase + 'postbox/uploadFile',
                data: {
                    file: file,
                    poboxNo: documentInfo.poboxNo,
                    emitrate: documentInfo.emirate,
                    uploadedDateTime: documentInfo.uploadedDateTime,
                    docName: documentInfo.docName,
                    docType: documentInfo.docType
                }
            }).then(function (resp) {
                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                deferred.resolve(resp);
            }, function (resp) {
                console.log('Error status: ' + resp.status);
                deferred.resolve(resp);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
            return deferred.promise;
        },

        holdPoBox: $resource(serviceBase + 'rent/pobox/hold?poboxNumber=:poboxNumber&lang=:lang', {
            poboxNumber: '@poboxNumber',
            lang: '@lang'
        }, {
                get: {
                    method: 'GET',
                    transformResponse: function (response) {
                        return angular.fromJson(response);
                    },
                    isArray: false
                }
            }),

        unHoldPoBox: $resource(serviceBase + 'rent/pobox/unhold?poboxNumber=:poboxNumber&lang=:lang', {
            poboxNumber: '@poboxNumber',
            lang: '@lang'
        }, {
                get: {
                    method: 'GET',
                    transformResponse: function (response) {
                        return angular.fromJson(response);
                    },
                    isArray: false
                }
            })
    }
};