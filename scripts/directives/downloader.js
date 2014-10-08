'use strict';

/*
 * simple directive which creates a hidden iframe and then listens for changes to the exportUrl property in the scope.
 * When a change is detected the src of the iframe is updated triggering the browser to perform a download.
 */
angular.module('directives.downloader', []).directive('downloader', ['$timeout', function ($timeout) {

    return {
        restrict: 'A',
        link: function (scope, element) {

            var iframe = angular.element('<iframe id=\"download_iframe\" name=\"download_iframe\" border=\"0\" width=\"0\" height=\"0\" style=\"width: 0px; height: 0px; border: none; display: none\" />');
            element.append(iframe);

            scope.$watch('exportUrl', function () {
                if (!_.isUndefined(scope.exportUrl)) {
                    iframe[0].src = scope.exportUrl;
                    $timeout(function () {
                        scope.exportUrl = undefined;
                    }, 500);
                }
            });

        }
    };

}]);