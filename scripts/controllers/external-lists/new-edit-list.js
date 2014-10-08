'use strict';

angular.module('controller.lists.edit', []).controller('NewEditListCtrl', ['$scope', '$modal', '$modalInstance', 'item', 'shellService', 'smartTableUtils',
    function ($scope, $modal, $modalInstance, item, shellService, smartTableUtils) {

        console.log('created edit lists controller');

        $scope.model = {
            list: item.data,
            listItems: smartTableUtils.prepareArray(item.data.listItems),
            listTypes: item.types || [],
            mayCreateLists: shellService.hasFunction('Add External Lists'),
            mode: item.mode,
            saveAttempted: false,
            availablePermissions: [],
            appliedPermissions: item.data.permissions,
            exportUrl: '/edge/v1/ext/lists/download/' + item.data.id,
            bulkUploadFormAction:'/edge/v1/ext/lists/convert'
        };

        $scope.init = function () {
            var roles = shellService.getAvailableRoles();

            // remove any applied permissions from the list of returned roles
            // first, create a map of the applied permissions
            var apMap = {};
            angular.forEach($scope.model.appliedPermissions, function (value) {
                apMap[value.permission] = true;
            });

            // now filter out those permissions from the returned roles list
            var available = _.filter(roles, function (role) {
                return !_.has(apMap, role.roleName);
            });

            // convert available roles into list permissions
            var _availablePermissions = [];
            angular.forEach(available, function (value) {
                _availablePermissions.push({ permission: value.roleName });
            });

            $scope.model.availablePermissions = _availablePermissions;

            if ($scope.model.mode === 'Update') {
                // can the user update the details of the list?
                if ($scope.model.list.type.permissions.length > 0) {
                    $scope.model.detailsLocked = true;
                    angular.forEach($scope.model.list.type.permissions, function (value) {
                        if (shellService.hasRole(value.permission)) {
                            $scope.model.detailsLocked = false;
                        }
                    });
                } else {
                    $scope.model.detailsLocked = false;
                }
            }
        };
        $scope.init();

        $scope.listTypeDisabled = function () {
            return $scope.model.mode === 'Update';
        };

        $scope.listTypeSelected = function () {
            return !_.isUndefined($scope.model.list.type);
        };

        $scope.showError = function (ngModelController, error) {
            if (ngModelController === undefined) {
                return false;
            }
            return ngModelController.$error[error] && $scope.model.saveAttempted;
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        $scope.save = function () {
            console.log('saving list');
            if (!this.newEditListForm.$valid) {
                $scope.model.saveAttempted = true;
            } else {
                $scope.model.list.listItems = $scope.model.listItems;
                smartTableUtils.stripArray($scope.model.list.permissions);
                $modalInstance.close($scope.model.list);
            }
        };

    }]
);