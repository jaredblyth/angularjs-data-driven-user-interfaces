'use strict';

angular.module('controller.reports.viewActiveModules', []).controller('ViewActiveModulesCtrl', ['$scope', '$rootScope','reportService', 'shellService', 'smartTableUtils',
    function ($scope, $rootScope, reportService, shellService, smartTableUtils) {

        console.log('created school active modules controller.');

		// INITIAL VALUES
        $scope.model = {
            initialised: false,
            email: shellService.getCurrentUser().emailAddress,
			smartTableActiveModulesReports: false,
			smartTableActiveModulesReportsRows: [],
			smartTableActiveModulesReportsColumns: [
                { label: 'Centre Code', map: 'centreCode'},
				{ label: 'Name', map: 'schoolName'},
				{ 'label': '', 'cellTemplateUrl': '/views/templates/edit-tablerow.html', 'isEditable': true }
            ],
            smartTableActiveModulesReportsConfig: {
                isPaginationEnabled: false,
				isGlobalSearchActivated: true,
                filterAlgorithm: smartTableUtils.filter
            },
			smartTableModules: false,
            smartTableModulesRows: [],
            smartTableModulesColumns: [
                { label: 'Modules', map: 'name'}
            ],
            smartTableModulesConfig: {
                isPaginationEnabled: false
            },
			schoolId: '',
			schoolName: ''
        };

		// FUNCTION THAT RUNS ON INITIALISATION
        $scope.init = function () {
            console.log('initialising school active modules control');
			$rootScope.$broadcast('workingStart');
            reportService.initialiseViewActiveModules().then(function (data) {
				$.each(data.hierarchyElements, function(idx, obj) {
					$scope.model.smartTableActiveModulesReportsRows.push({"centreCode":(obj.centreCode),"schoolName":(obj.schoolName),"schoolId":(obj.schoolId)});
				});
                $scope.model.initialised = true;
				$rootScope.$broadcast('workingStop');
				$scope.model.smartTableActiveModulesReports = true;
            }, function () {
                $rootScope.$broadcast('workingStop');
				$rootScope.messageError = 'Unable to load active modules at the moment';
				$rootScope.$broadcast('toastMessageUpdateError');
            });
        };
        $scope.init();

		// FUNCTION THAT RUNS WHEN USER CLICKS EMAIL BUTTON
		$scope.emailReport = function () {
		
			reportService.generateSchoolModulesReport($scope.model.email).then(function () {
				shellService.saveComplete();
				$rootScope.$broadcast('workingStop');
				$rootScope.messageSuccess = 'Report successfully emailed to ' + $scope.model.email;
				$rootScope.$broadcast('toastMessageUpdateSuccess');
			}, function () {
				shellService.saveComplete();
				$rootScope.messageError = 'Failed to send report via email';
				$rootScope.$broadcast('toastMessageUpdateError');
			});
		
		};

		// FUNCTION TO VIEW DETAILS OF A MODULE
		$scope.$on('edit', function (event, data) {
			$rootScope.$broadcast('workingStart');
			$scope.model.schoolName = data.schoolName;
			$scope.model.schoolId = data.schoolId;
			$scope.model.smartTableModulesRows = [];
			reportService.initialiseSchoolActiveModules($scope.model.schoolId).then(function (data) {
				$.each(data.modules, function(idx, obj) {
					$scope.model.smartTableModulesRows.push({"name":(obj.name)});
				});
				$scope.model.smartTableModules = true;
				$rootScope.$broadcast('workingStop');
			}, function () {
				$rootScope.$broadcast('workingStop');
				$rootScope.messageError = 'Failed to load module information';
				$rootScope.$broadcast('toastMessageUpdateError');
            });
		
			
		});

		// FUNCTION TO CLOSE VIEW DETAILS OF A MODULE
		$scope.displayClose = function () {
			$scope.model.smartTableModules = false;
			$scope.model.smartTableModulesRows = [];
		};

    }]);
