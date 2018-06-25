export default function renewFactory($resource, ngAuthSettings) {
    'use strict';
    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    return {
        getRenewablePoBoxDetails: $resource(serviceBase + 'renew/boxDetails', {
            pobox_id: '@pobox_id',
            box_number: '@box_number',
            emirate_id: '@emirate_id',
            bundle_id: '@bundle_id',
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

        renewPoBox: $resource(serviceBase + 'renew/renewbox', {}, {
            query: {
                method: 'POST',
                transformResponse: function (response, headers) {
                    return angular.fromJson(response);
                }
            },
            isArray: false
        })
    }

}