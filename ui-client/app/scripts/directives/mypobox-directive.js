export function numbersOnly() {
    'use strict';
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-5]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
}

export function formInput(formHelper) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        templateUrl: formHelper.getTemplateConfig().fileUploadUrl,
        link: function (scope, element, attributes, ngModel) {
            //scope.ngModel = attributes.ngModel;
            scope.filetext = attributes.filetext;
            scope.nametext = attributes.nametext;
        },
        scope: {
            filetext: '=',
            nametext: '=',
            uploadFile: '&',
            deleteFile: '&',
            required: '=',
            ngModel: '=',
            updateparent: '&'
        }
    };
}

export function tabForm(formHelper) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: formHelper.getTemplateConfig().tabFormUrl,
        link: function (scope, element, attributes) {
        }
    };
}