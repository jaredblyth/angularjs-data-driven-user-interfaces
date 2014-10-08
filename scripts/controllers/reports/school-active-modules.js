'use strict';

angular.module('controller.reports.schoolActiveModules', []).controller('SchoolActiveModulesCtrl', ['$scope', '$modalInstance','reportService', 'shellService', 'smartTableUtils', 'item',
    function ($scope, $modalInstance, reportService, shellService, smartTableUtils, item) {

        console.log('created school active modules controller.');

        $scope.model = {
            initialised: false,
            schoolName: item.schoolName,
            schoolId: item.schoolId,
            modules: [],
            moduleColumns: [
                { label: 'Module', map: 'name'}
            ],
            modulesConfig: {
                isPaginationEnabled: false,
                filterAlgorithm: smartTableUtils.filter
            }
        };

        /* called immediately to initialise the view active modules controller */
        $scope.init = function () {
            console.log('initialising school active modules control');
            reportService.initialiseSchoolActiveModules($scope.model.schoolId).then(function (data) {
                $scope.model.modules = smartTableUtils.prepareArray(data.modules);
                $scope.model.initialised = true;
            }, function () {
                shellService.notify('Failed to load modules for school', true);
            });
        };
        $scope.init();

        $scope.cancel = function () {
            console.log('cancel called');
            $modalInstance.dismiss();
        };
    }]);
