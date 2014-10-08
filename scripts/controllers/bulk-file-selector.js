'use strict';

angular.module('controller.bulkfile', []).controller('BulkFileSelectorCtrl',
    ['$scope', '$modalInstance', 'item', function ($scope, $modalInstance, item) {

    console.log('created bulk file selector controller');

    $scope.model = {
        listItems: [],
        processedMsg: '',
        typeId: item.typeId,
        formAction: item.formAction
    };

    $scope.uploadComplete = function (content, completed) {
        if (completed && content.length > 0) {
            console.log('completed!!!');
            $scope.model.listItems = content;
            $scope.model.processedClass = '';
            $scope.model.processedMsg = 'File upload completed, found ' + $scope.model.listItems.length + ' items';
        }else{
            console.log('nothing seems to be returned');
            $scope.model.processedClass = 'help-inline-xlarge';
            $scope.model.processedMsg = 'File upload did not return any data. Is the file formatted correctly?';
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

    $scope.select = function () {
        $modalInstance.close({
            items: $scope.model.listItems,
            operation: item.operation
        });
    };

}]
);