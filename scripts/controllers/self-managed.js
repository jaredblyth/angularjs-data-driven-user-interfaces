'use strict';

angular.module('controller.selfManaged', []).controller('SelfManagedBulkUpdateCtrl', ['$scope', '$modal', 'selfManagedService', 'smartTableUtils', '$timeout', 'shellService', '$rootScope',
    function ($scope, $modal, selfManagedService, smartTableUtils, $timeout, shellService, $rootScope) {

        console.log('created self managed update controller, retrieving existing school settings ...');



		// INITIAL VALUES
        $scope.model = {
            initialised: false,
			email: shellService.getCurrentUser().emailAddress,
			smartTableSelfManaged: false,
			smartTableSelfManagedRows: [],
			smartTableSelfManagedColumns: [
				{'label':'School','map':'schoolName', isSortable:false},
				{'label':'Centre Code','map':'centreCode', isSortable:false},
				{'label':'Self-Managed','map':'selfManaged', isSortable:false, cellClass: 'smart-table-centred-cell', cellTemplateUrl: '/intadmin/views/templates/self-managed/toggle-column.html'},
				{'label':'Active Date','map':'activeDate', isSortable:false, cellTemplateUrl: '/intadmin/views/templates/self-managed/active-date-column.html'}
			],			
			smartTableSelfManagedConfig: {
				isPaginationEnabled: false,
				isGlobalSearchActivated: true,
                filterAlgorithm: smartTableUtils.filter,
                defaultSortColumn: 0
            },
			saveChanges: false            
        };

		

		// FUNCTION THAT RUNS ON INITIALISATION
        $scope.init = function () {
            console.log('initialising view self managed controller, retrieving all schools ...');
			$rootScope.$broadcast('workingStart');
			selfManagedService.initialiseSelfManaged().then(function (data) {
				$.each(data.selfManagedSchoolDetailsList, function(idx, obj) {
					$scope.model.smartTableSelfManagedRows.push({"id":(obj.id),"centreCode":(obj.centreCode),"schoolName":(obj.schoolName),"selfManaged":(obj.selfManaged),"activeDate":(obj.activeDate)});
				});
				$scope.model.smartTableSelfManaged = true;
				$rootScope.$broadcast('workingStop');
				$scope.model.initialised = true;
            }, function () {
                $rootScope.$broadcast('workingStop');
				$rootScope.messageError = 'Unable to load self-managed information';
				$rootScope.$broadcast('toastMessageUpdateError');
            });
            
        };
        $scope.init();



		// FUNCTION THAT RUNS WHEN USER CLICKS EMAIL BUTTON
		$scope.emailReport = function () {
			$rootScope.$broadcast('workingStart');
			selfManagedService.generateReport($scope.model.email).then(function () {
                $rootScope.$broadcast('workingStop');
				shellService.saveComplete();
				$rootScope.messageSuccess = 'Report emailed to ' + $scope.model.email;
				$rootScope.$broadcast('toastMessageUpdateSuccess');
			}, function () {
				shellService.saveComplete();
				$rootScope.$broadcast('workingStop');
				$rootScope.messageError = 'Failed to send report via email';
				$rootScope.$broadcast('toastMessageUpdateError');
			});
		};



		// FUNCTION THAT RUNS WHEN USER TOGGLES SELF-MANAGED BUTTON
		$scope.$on('toggleSelfManaged', function (event, data) {
            console.log('Toggling Self Managed');
            data.selfManaged = !data.selfManaged;
            data._edited = !data._edited;
			$scope.model.saveChanges = true;
        });
		
		
		// FUNCTION THAT RUNS WHEN USER CLICKS SAVE BUTTON
		$scope.saveChanges = function () {
			var updates = {
                selfManaged: [],
                nonSelfManaged: []
            };

            var existingChanges = false;

            angular.forEach($scope.model.smartTableSelfManagedRows, function (value) {
                if (value._edited) {
                    existingChanges = true;
                    if (value.selfManaged) {
                        updates.selfManaged.push(value.id);
                    } else {
                        updates.nonSelfManaged.push(value.id);
                    }
                }
            });

            if (existingChanges) {
				console.log(JSON.stringify(updates));
				$rootScope.$broadcast('workingStart');
                selfManagedService.batchUpdateSelfManaged(updates).then(function (data) {
                    console.log('Self Managed Schools Updated');
					$rootScope.$broadcast('workingStop');
					shellService.saveComplete();
					$rootScope.messageSuccess = 'Self-managed list updated';
					$rootScope.$broadcast('toastMessageUpdateSuccess');
                    
					$timeout(function () {
						
                        
                    }, 0);
                }, function () {
                    //shellService.saveComplete();
					//$rootScope.$broadcast('workingStop');
					//$rootScope.messageError = 'Failed to save changes';
					//$rootScope.$broadcast('toastMessageUpdateError');
					
                });
					
            } else {
                shellService.saveComplete();
				$rootScope.$broadcast('workingStop');
				$rootScope.messageInfo = 'There are no changes to save';
				$rootScope.$broadcast('toastMessageUpdateInfo');
					
            }
		};


		

        

    }]);