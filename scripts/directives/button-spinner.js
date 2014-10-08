'use strict';

/*
 * Save button directive
 */
angular.module('directives.button.spinner', []).directive('spinnerButton', function () {
    return {
        restrict: 'A',
        scope: true,
        controller: ['$scope', '$timeout', function ($scope, $timeout) {
            $scope.$on('stopSpinner', function () {
                //without a timeout there is no real indication this has been triggered and validation
                // will happen too fast to trigger the stop event, locking the UI
                $timeout(function () {
                    //unshade the UI
                    $('#shade').css('display', 'none');
                    //stops all the buttons! TODO: bnn this feels dirty and might be handled better...
                    Ladda.stopAll();
                }, 100);
            });
        }],
        link: function postLink(scope, element, attrs) {
            var shadeUI = true;
            if(typeof attrs.spinnerButtonLock !== 'undefined'){
                 shadeUI = shadeUI === 'true';
            }
            element.addClass('ladda-button');
            attrs.$set('dataStyle', 'expand-right');
            var l = Ladda.create(element[0]);
            element.bind('click', function () {
                l.start();
                if (shadeUI) {
                    //shade the UI to stop input
                    $('#shade').css('display', 'block');
                }
            });
        }
    };
});