'use strict';

angular.module('controller.confirmdeny', []).controller('ConfirmDenyCtrl', ['$scope', '$modalInstance', 'item',
    function ($scope, $modalInstance, item) {

        console.log('created confirm discard changes controller, retrieving existing roles ...');

        $scope.model = {
            title: item.title,
            message: item.message
        };

        $scope.confirm = function () {
            $modalInstance.close(true);
        };

        $scope.deny = function () {
            $modalInstance.close(false);
        };

    }]);