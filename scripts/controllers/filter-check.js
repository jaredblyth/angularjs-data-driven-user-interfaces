'use strict';

angular.module('controller.filterCheck', []).controller('FilterCheckCtrl', ['$scope', 'filterCheckService', 'shellService', '$rootScope',
    function ($scope, filterCheckService, shellService, $rootScope) {

        console.log('created filter-check controller.');

		
		
		// INITIAL VALUES
        $scope.model = {
            initialised: false,
            testAttempted: false,
            filterCheckUsers: [],
            url: '',
            protocolTypes: [
                {name: 'http', value: 'http://'},
                {name: 'https', value: 'https://'},
                {name: 'ftp', value: 'ftp://'}
            ],
			testFilterCheckUser: '',
			testProtocolType: '',
			allowed: '',
			unknown: '',
			blocked: '',
			resultText: '',
			debugText: ''
        };

		
		
		// FUNCTION THAT RUNS ON INITIALISATION
        $scope.init = function () {
            console.log('initialising view filter check controller, retrieving all user types...');
			$rootScope.$broadcast('workingStart');
            filterCheckService.initialiseFilterCheck().then(function (data) {
                $scope.model.filterCheckUsers = data.filterCheckUserList;
                $scope.model.initialised = true;
			$rootScope.$broadcast('workingStop');
            
			}, function () {
			$rootScope.$broadcast('workingStop');
			$rootScope.messageError = 'Unable to load User Types at the moment';
			$rootScope.$broadcast('toastMessageUpdateError');
            });
        };
        $scope.init();
		
		
		
		// FUNCTION THAT RUNS WHEN USER SELECTS A USER TYPE
		$scope.updateFilterCheckUser = function () {
			$scope.model.testFilterCheckUser = $scope.model.selectedFilterCheckUser.misId;
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER SELECTS A URL PROTOCOL
		$scope.updateProtocolType = function () {
			$scope.model.testProtocolType = $scope.model.selectedProtocolType.value; 
		};
		
		
		
		// VALIDATION FUNCTION
		$scope.showError = function (ngModelController, error) {
            if (ngModelController === undefined) {
                return false;
            }
            return ngModelController.$error[error] && $scope.model.testAttempted;
        };
		
		
		
		// FUNCTION THAT RUNS WHEN USER CLICKS 'TEST' BUTTON
		$scope.test = function (filterCheckForm) {
		
			// Clear previous results & messages
			$scope.model.allowed = false;
			$scope.model.blocked = false;
			$scope.model.unknown = false;
			
			// validate form
            if (!filterCheckForm.$valid) {
                console.log('Form is not valid');
                $scope.model.testAttempted = true;
                shellService.saveComplete();
            } else {
			
				// Further validate input by adding defaults
				if ($scope.model.testFilterCheckUser == '') {$scope.model.testFilterCheckUser = 'FCSUser'}
				if ($scope.model.testProtocolType == '') {$scope.model.testProtocolType = 'http://'}
				//if($scope.model.url.indexOf('.') == -1) {$scope.model.url = $scope.model.url + '.com'}

				// Build object to pass to test service as a parameter
				var filterCheckRequest = {
					misId: $scope.model.testFilterCheckUser,
					schoolId: $rootScope.currentSchoolId,
					url: $scope.model.testProtocolType + $scope.model.url
				}
				console.log(JSON.stringify(filterCheckRequest));
			
				$rootScope.$broadcast('workingStart');
				
				// Call test service
				filterCheckService.test(filterCheckRequest).then(function (data) {
					console.log(JSON.stringify(data));
					shellService.saveComplete();
					$rootScope.$broadcast('workingStop');
					$scope.model.resultText = String(data.response);
				
					// Determine results
					if ($scope.model.resultText.indexOf('Allowed') !== -1)
						{$scope.model.allowed = true;}

					else if ($scope.model.resultText.indexOf('Blocked') !== -1)
						{$scope.model.blocked = true;}
				
					else {$scope.model.unknown = true;}
				
					//$scope.model.resultText = $scope.model.testProtocolType + $scope.model.url + '  -  ' + $scope.model.resultText;
				
				
				// Function if unsuccessful test
				}, function() {
					shellService.saveComplete();
					$rootScope.$broadcast('workingStop');
					$rootScope.messageError = 'Unable to complete filter check at this time';
					$rootScope.$broadcast('toastMessageUpdateError');
				});
			
			} //End else
		};

        

    }]);