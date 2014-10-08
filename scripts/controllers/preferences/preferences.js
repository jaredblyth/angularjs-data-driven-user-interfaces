'use strict';

angular.module('controller.preferences', []).controller('PreferencesCtrl', ['$scope', '$modal', 'preferencesService', 'shellService', '$rootScope',
    function ($scope, $modal, preferencesService, shellService, $rootScope) {

        console.log('created school preferences controller');

        $scope.model = {
            preferenceValue: false,
            initialised: false,
            checked: '',
            preferenceName: 'NotifyNewlySuspendedUserOnly',
            saveAttempted: false
        };
		

        $scope.init = function () {
			$rootScope.$broadcast('workingStart');
			console.log($rootScope.currentSchoolQedUniqueId);
            preferencesService.initPreferences($scope.model.preferenceName,$rootScope.currentSchoolQedUniqueId).then(function (data) {
                $scope.model.preferenceValue = data.qedPreference.value;

                // we need this for the ng-checked property
                if($scope.model.preferenceValue == 'true') {
                    $scope.model.checked = 'checked';
                } else {
                    $scope.model.checked = null;
                }
                $scope.model.initialised = true;
				$rootScope.$broadcast('workingStop');
			}, function () {
                console.log('Failed to load school preferences');
				$rootScope.$broadcast('workingStop');
				$rootScope.messageError = 'Failed to load school preferences';
				$rootScope.$broadcast('toastMessageUpdateError');
            });
        };
        $scope.init();

		$scope.cancel = function () {
            $modalInstance.dismiss();
			console.log('school preferences update cancelled');
        };

        $scope.submit = function (schoolPreferencesForm) {
            $scope.model.saveAttempted = true;
			$rootScope.$broadcast('workingStart');
            preferencesService.saveUpdates($scope.model.preferenceName, $scope.model.preferenceValue,$rootScope.currentSchoolQedUniqueId).then(function (data) {
                $scope.model.preferenceValue = data.qedPreference.value;

                // we need this for the ng-checked property to save correctly - but it won't refresh screen correctly (therefore see code below at line 58)
                if($scope.model.preferenceValue == 'true') {
                    $scope.model.checked = 'checked';
                } else {
                    $scope.model.checked = null;
                }
                shellService.saveComplete();
				$rootScope.messageSuccess = 'School Preferences have been saved';
				$rootScope.$broadcast('toastMessageUpdateSuccess');
				
				// This is a slight repeat of above code at line 48 but is required for proper screen refresh after save
				if($scope.model.preferenceValue == 'true') {
                    $scope.model.checked = true;
                } else {
                    $scope.model.checked = false;
                }
				
            }, function () {
                shellService.saveComplete();
				$rootScope.messageError = 'School Preferences failed to save';
				$rootScope.$broadcast('toastMessageUpdateError');
            });
        };


    }]
);