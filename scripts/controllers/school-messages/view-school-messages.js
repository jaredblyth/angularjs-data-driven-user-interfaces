'use strict';

angular.module('controller.schoolMessages.view', []).controller('SchoolMessagesCtrl',
    ['$scope', '$modal', 'schoolMessagesService', 'smartTableUtils', 'shellService', '$rootScope',
        function ($scope, $modal, schoolMessagesService, smartTableUtils, shellService, $rootScope) {

		
		
			// INITIAL VALUES
            $scope.model = {
                initialised: false,
                schoolMessages: [],
                smarttableSchoolMessagesColumns: [
                    { label: 'School Group', map: 'displayName',
                      cellTemplateUrl: '/views/templates/edit-tablerow.html',
                      reverse: false }
                ],
                smarttableSchoolMessagesConfig: {
                    isPaginationEnabled: false,
                    defaultSortColumn: 0
                },
				updateMessage: false,
				updateMessageContent: '',
				temp: '',
				updatesToSave: false
            };



			// FUNCTION THAT RUNS ON INITIALISATION
            $scope.init = function () {
				$rootScope.$broadcast('workingStart');
                schoolMessagesService.findSchoolMessages().then(function (data) {
					console.log(JSON.stringify(data));
					$.each(data.schoolMessages, function(idx, obj) {
						$scope.model.schoolMessages.push({'displayName':(obj.displayName),'id':(obj.id),'misId':(obj.misId),'lastUpdated':(obj.lastUpdated),'schoolGroup':(obj.schoolGroup),'message':(obj.message)});
					});
					$rootScope.$broadcast('workingStop');
                    $scope.model.initialised = true;
                }, function () {
                    $rootScope.$broadcast('workingStop');
					$rootScope.messageError = 'Unable to load school messages';
					$rootScope.$broadcast('toastMessageUpdateError');
                });
            };
           $scope.init();

		   
		   
		   // FUNCTION THAT RUNS WHEN USER CLICKS EDIT BUTTON
            $scope.$on('edit', function (event, data) {
				$scope.model.updateMessageContent = data.message;
				$scope.model.temp = data;
				$scope.model.updateMessage = true;
			
            });



			// FUNCTION THAT RUNS WHEN USER CHANGES A MESSAGE
			$scope.update = function () {

				for (var i = 0; i < $scope.model.schoolMessages.length; i++) {
                    if ($scope.model.schoolMessages[i].$$hashKey === $scope.model.temp.$$hashKey) {
                    $scope.model.schoolMessages[i]._edited = true;
                    $scope.model.schoolMessages[i].message = $scope.model.updateMessageContent;
                    $scope.model.schoolMessages[i].misId = shellService.getCurrentUser().misId;
                    $scope.model.schoolMessages[i].lastUpdated = Date.now();
                    //console.log(JSON.stringify($scope.model.schoolMessages[i]));
                    break;
                    }
                }
                    $scope.model.updatesToSave = true;
			};



			// FUNCTION THAT RUNS WHEN USER CLICKS UPDATE BUTTON
            $scope.save = function () {
                console.log('time to save all the changes (if any have been made)');
				$rootScope.$broadcast('workingStart');
				
                var updates = {
                    addedSchoolMessages: [],
                    updatedSchoolMessages: []
                };

                // locate added, updated, and deleted school message and add to the updates object appropriately
                for (var i = 0; i < $scope.model.schoolMessages.length; i++) {
                    var type = $scope.model.schoolMessages[i];
                    if (type._added) {
                        updates.addedSchoolMessages.push(smartTableUtils.stripObject(angular.copy(type)));
                    } else if (type._edited) {
                        updates.updatedSchoolMessages.push(smartTableUtils.stripObject(angular.copy(type)));
                    }
                }

                schoolMessagesService.saveUpdates(updates).then(function (data) {
				console.log(JSON.stringify(updates));
                    $scope.model.schoolMessages = smartTableUtils.prepareArray(data);
                    shellService.saveComplete();
					$rootScope.$broadcast('workingStop');
					$rootScope.messageSuccess = 'Changes to school message(s) saved';
					$rootScope.$broadcast('toastMessageUpdateSuccess');
                }, function () {
                    shellService.saveComplete();
					$rootScope.$broadcast('workingStop');
					$rootScope.messageError = 'Unable to save changes';
					$rootScope.$broadcast('toastMessageUpdateError');
                });
            };

        }]
);