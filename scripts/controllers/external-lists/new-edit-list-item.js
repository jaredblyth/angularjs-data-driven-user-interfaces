'use strict';

angular.module('controller.lists.itemedit', []).controller('NewEditListItemCtrl',
    ['$scope', '$modalInstance', 'item', 'dateUtils', 'formatUtils', function ($scope, $modalInstance, item, dateUtils, formatUtils) {

        console.log('create new / edit list item controller');

        $scope.model = {
            listItem: item.data.listItem,
            mode: item.mode,
            invalidValues: item.data.invalidValues,
            exampleValue: item.data.listType.exampleValue,
            saveAttempted: false
        };

        $scope.init = function () {
            var validValues = item.data.listType.validValues;
            if (_.isNull(validValues) || _.isUndefined(validValues) || _.isEmpty(validValues)) {
                $scope.model.validationRegex = new RegExp(item.data.listType.validationRegex);
            } else {
                $scope.model.validValues = validValues.split(',');
            }

            if ($scope.model.mode === 'Update') {
                // need to convert dates from millisecond value
                $scope.model.listItem.startDate = formatUtils.formatDate($scope.model.listItem.startDate);
                $scope.model.listItem.expireDate = formatUtils.formatDate($scope.model.listItem.expireDate);
            }

        };
        $scope.init();

        $scope.isValidValue = function (value) {
            return $scope.model.validationRegex.test(value);
        };

        $scope.typeHasValidValues = function () {
            return _.isUndefined($scope.model.validationRegex);
        };

        $scope.$on('delete', function (event, data) {
            data._deleted = true;
        });

        $scope.$on('undelete', function (event, data) {
            data._deleted = false;
        });

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
            if ($scope.model.listItem.itemValue){
                $scope.model.listItem.itemValue.trim();
            }
            if (!this.editListItemForm.$valid) {
                $scope.model.saveAttempted = true;
            } else {
                // convert date to required format before returning
                $scope.model.listItem.startDate = dateUtils.convertDate($scope.model.listItem.startDate);
                $scope.model.listItem.expireDate = dateUtils.convertDate($scope.model.listItem.expireDate);
                $scope.model.listItem.comment = $scope.model.listItem.comment || '';

                $modalInstance.close($scope.model.listItem);
            }
        };

    }]
);

