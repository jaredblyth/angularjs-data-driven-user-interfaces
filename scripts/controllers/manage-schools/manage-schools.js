'use strict';

angular.module('controller.manageSchools', []).controller('ManageSchoolsCtrl', ['$scope', '$modal', 'shellService', '$rootScope', '$http',
    function ($scope, $modal, shellService, $rootScope, $http) {

        console.log('created manage schools controller');

        $scope.model = {
            initialised: false,
			smartSearchPhrase: '',
			smartSearchResults: [],
			smartSearchValidationTimer: ''
        };
		

        $scope.init = function () {
			$rootScope.$broadcast('workingStart');
			$scope.model.misId = shellService.getCurrentUser().misId;
			console.log('init manage schools controller');
			$rootScope.$broadcast('workingStop');
			$('.panel').css('overflow','visible');
        };
        $scope.init();


		
		// FUNCTION THAT ASYNCHRONOUSLY LOADS DATA AS USER TYPES INTO THE SMART SEARCH INPUT BOX
		$scope.model.smartSearchResults = function(val) {
			return $http.get('/intadmin/edge/v1/smartsearch/searchSchool/' + $scope.model.misId + '/' + val, {
			}).then(function(res){
				$rootScope.$broadcast('workingStart');
				
				// Notify user that there is no data returned for search
				if (res.data.length == 0)
					{$rootScope.messageInfo = 'No data available for your search';
					$rootScope.$broadcast('toastMessageUpdateInfo');}

				var results = [];
		
				$.each(res.data, function(idx, obj) {
		
					// Check whether user searched using letters or numbers
					var screenName;
					var str = $scope.model.smartSearchPhrase.replace(/\s+/g, '');
						if (isNaN(str))
							{screenName = obj.displayName;}
						else {screenName = obj.centreCode;}
		
					results.push({"displayName":obj.displayName,"misId":obj.misId,"type":obj.type,"centreCode":obj.centreCode,"qedUniqueId":obj.qedUniqueId,"matchingAttribute":obj.matchingAttribute,"screenName":screenName});
				});

				$rootScope.$broadcast('workingStop');
	
				return results;
			});
		};
		
		
		
		// FUNCTION TO VALIDATE NUMBER OF CHARACTERS TYPED INTO SEARCH BOX
		$scope.validate = function () {
			searchBoxButton.disabled = true;
			$('#smartSearchValidationError').css('display','none');
			clearTimeout($scope.model.smartSearchValidationTimer);
			if ($scope.model.smartSearchPhrase.length < 2)
				{
				$scope.model.smartSearchValidationTimer = setTimeout(function(){$('#smartSearchValidationError').css('display','block');}, 2000);
				}
        };
		
		
		
		// FUNCTION THAT RUNS WHEN USER SELECTS FROM SMART SEARCH RESULTS
		$scope.onSelect = function ($item, $model, $label) {
			searchBoxButton.disabled = false;
			$('#smartSearchValidationError').css('display','none');
			clearTimeout($scope.model.smartSearchValidationTimer);
			searchBoxButton.title = 'Please click this button to perform a search on your selection';
			$scope.model.smartSearchPhrase = '';
			$scope.$item = $item;
			$scope.$model = $model;
			$scope.$label = $label;
			
			console.log(JSON.stringify($scope.$item));
			$scope.model.searchType = $scope.$item.type;
			
			$scope.smartSearchProcess();
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER SEARCHES WITH SMART SEARCH SELECTION
		$scope.smartSearchProcess = function () {
			shellService.swapSchoolContext($scope.$item.centreCode).then(function (data) {
				console.log('New school data = ' + JSON.stringify(data));
				$rootScope.currentSchoolName = data.hierarchy.eqSchool.eqSchoolName;
				$rootScope.currentSchoolCentreCode = data.hierarchy.eqSchool.centreCode;
				$rootScope.displaySchoolCentreCode = '(' + $rootScope.currentSchoolCentreCode + ')';
				$rootScope.currentSchoolQedUniqueId = data.hierarchy.eqSchool.qedUniqueId;
				$scope.revert = true;
				$rootScope.messageInfo = "You are now administering " + $rootScope.currentSchoolName + ' ' + $rootScope.displaySchoolCentreCode;
				$rootScope.$broadcast('toastMessageUpdateInfo');
			});
        };
		
		
		
		// FUNCTION THAT RUNS WHEN USER CLICKS BUTTON TO REVERT TO DEFAULT SCHOOL
		$scope.revertToDefaultSchool = function () {
			$rootScope.currentSchoolName = $rootScope.defaultSchoolName;
			$rootScope.currentSchoolCentreCode = $rootScope.defaultSchoolCentreCode;
			$rootScope.displaySchoolCentreCode = '(' + $rootScope.currentSchoolCentreCode + ')';
			$rootScope.currentSchoolQedUniqueId = $rootScope.defaultSchoolQedUniqueId;
			$scope.revert = false;
			$rootScope.messageInfo = "You have changed back to your default school " + $rootScope.currentSchoolName + ' ' + $rootScope.displaySchoolCentreCode;
			$rootScope.$broadcast('toastMessageUpdateInfo');
		};
		
		
    }]
);