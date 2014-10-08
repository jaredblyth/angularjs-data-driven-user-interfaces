'use strict';

angular.module('controller.filterPackages.generatereport', []).controller('GenerateFilterPackageReportTemplateCtrl', ['$scope', 'filterPackagesService', 'shellService', 'smartTableUtils', '$rootScope',
    function ($scope, filterPackagesService, shellService, smartTableUtils, $rootScope) {

        console.log('created display filter package report controller, retrieving info ...');

        $scope.model = {
            initialised: false,
			currentSchool: '',
			user: shellService.getCurrentUser().emailAddress,
            hierarchy: shellService.getCurrentEntity(),
			centreCode: '',
			qedUniqueId: '',
			elementId: '',
            filterPackages: [],
            reportColumns: [
                { label: 'Name', map: 'name', reverse: false }
            ],
            packageConfig: {
                isPaginationEnabled: false,
                defaultSortColumn: 0
            },
			bulkOperations: [ '-- bulk operations --', 'Export' ],
        };

        $scope.init = function() {
			$scope.model.operation = $scope.model.bulkOperations[0];
			$scope.model.currentSchool = $rootScope.currentSchoolName;
			$scope.model.centreCode = $rootScope.currentSchoolCentreCode;
			$scope.model.qedUniqueId = $rootScope.currentSchoolQedUniqueId;
            $scope.model.elementId = shellService.getCurrentEntity().id;
            filterPackagesService.getFilterPackageReportData($scope.model.elementId, shellService.getCurrentEntity().eqSchool.qedUniqueId).then(function (data) {
                $scope.model.filterPackages = smartTableUtils.prepareArray(data);
                $scope.model.initialised = true;
            }, function () {
				$rootScope.$broadcast('workingStop');
				$rootScope.messageError = 'Failed to load existing filter packages';
				$rootScope.$broadcast('toastMessageUpdateError');
            });
        };
        $scope.init();
		
		
		$scope.generateEmailReport = function() {
			filterPackagesService.generateReport($scope.model.elementId, $scope.model.centreCode, $scope.model.user, $scope.model.qedUniqueId).then(function (data) {
				$rootScope.$broadcast('workingStop');
				$rootScope.messageSuccess = 'Report successfully emailed';
				$rootScope.$broadcast('toastMessageUpdateSuccess');
            }, function () {
				$rootScope.$broadcast('workingStop');
				$rootScope.messageError = 'Failed to generate email report';
				$rootScope.$broadcast('toastMessageUpdateError');
            });
			
			shellService.saveComplete();
		};
		
		$scope.bulk = function () {
            switch ($scope.model.operation) {
                case $scope.model.bulkOperations[1]:
                    console.log('exporting filter package report');
                    $scope.exportUrl = '/intadmin/edge/v1/policy/packages/downloadFilterPackageReport/' + $scope.model.hierarchy.id + '/' + shellService.getCurrentEntity().eqSchool.qedUniqueId;
					location.href = $scope.exportUrl
                    break;
            }
            $scope.model.operation = $scope.model.bulkOperations[0];
        };

    }]);
