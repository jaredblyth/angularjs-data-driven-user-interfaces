'use strict';

angular.module('directives.menuitems', []).directive('menuitems', function () {
    return {
        restrict: 'A',
        templateUrl: '/views/templates/menu-items.html'
    };
});
