'use strict';

angular.module('controller.roles', []).controller('ViewRolesCtrl', ['$scope', '$modalInstance', 'shellService', 'smartTableUtils',
        function($scope, $modalInstance, shellService, smartTableUtils) {

    console.log('created view roles controller, retrieving existing roles ...');

    $scope.model = {
        initialised: false,
        roles: [],
        roleColumns: [
            { label: 'Name', map: 'roleName', cellTemplateUrl:'views/templates/role-column.html', reverse: false }
        ],
        roleConfig: {
            isPaginationEnabled: false,
            defaultSortColumn: 0
        }
    };

    $scope.init = function () {
        $scope.model.roles = smartTableUtils.prepareArray(shellService.getAvailableRoles());
        $scope.model.initialised = true;
    };
    $scope.init();

    $scope.close = function () {
        $modalInstance.dismiss();
    };

}]);