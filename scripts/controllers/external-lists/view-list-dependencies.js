'use strict';

angular.module('controller.lists.viewListDependencies', []).controller('ViewListDependenciesCtrl', ['$scope', '$modalInstance', 'smartTableUtils', 'item',
    function ($scope, $modalInstance, smartTableUtils, item) {

        console.log('created view list dependencies controller.');

        $scope.model = {
            initialised: false,
            listUsages: [],
            listUsageColumns: [
                { label: 'Centre Code', map: 'centreCode'},
                { label: 'External List Name', map: 'externalListName'},
                { label: 'Filter Package', map: 'filterPackageName'},
                { label: 'Filter Package List', map: 'filterPackageListName'}
            ],
            listUsageConfig: {
                isPaginationEnabled: false,
                filterAlgorithm: smartTableUtils.filter
            }
        };

        /* called immediately to initialise the view active modules controller */
        $scope.init = function () {
            console.log('initialising view list dependencies control');
            $scope.model.listUsages = smartTableUtils.prepareArray(item.externalListUsages);
            $scope.model.initialised = true;
        };
        $scope.init();

        $scope.cancel = function () {
            console.log('cancel called');
            $modalInstance.dismiss();
        };
    }]);
