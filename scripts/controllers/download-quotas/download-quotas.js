'use strict';

angular.module('controller.downloadQuotas', [])

.run(function($rootScope) {
    $rootScope.rows =  '';
})

.controller('DownloadQuotasCtrl', ['$scope', '$rootScope', '$modal', '$modalInstance', 'downloadQuotasService', 'smartTableUtils', 'shellService', 'userSearchService', 'groupSearchService',
    function ($scope, $rootScope, $modal, $modalInstance, downloadQuotasService, smartTableUtils, shellService, userSearchService, groupSearchService) {


        console.log('created download quotas controller');

		
		// INITIAL VALUES
        $scope.model = {
            initialised: false,
			saveAttempted: false,
			centreCode: '',
			dropDownOptions:  '',
			selectedGroupFromList: '',
			mbValue: 0,
			totalSelections: [],
			userDNList: [],
			groupQuotas: {},
			smartTableGroupsRows: [],
			smartTableGroupsColumns: [
				{'label':'Group Name','map':'cn'},
				//{'label':'Current Quota (MB)','map':'downloadLimit','isEditable': true, type: 'number','cellTemplateUrl':'views/templates/input-field.html'}
				{'label':'Current Quota (MB)','map':'downloadLimit','isEditable': true, type: 'number', cellClass: "download-value-cell"}
			],			
			smartTableGroupsConfig: {
				isPaginationEnabled: false,
                defaultSortColumn: 0
            },
			smartTableUsersRows: [],
			smartTableUsersColumns: [
				{'label':'User Name','map':'displayName'},
				{'label':'Current Quota (MB)','map':'downloadLimit'},
				{'label':'Remove','cellTemplateUrl':'views/templates/smarttable-delete-row.html', 'isEditable': true}
			],			
			smartTableUsersConfig: {
				isPaginationEnabled: false,
                defaultSortColumn: 0
            }
		};
		console.log('download quotas $scope.model config set');
		
		
		
		// VALIDATION FUNCTION
		$scope.showError = function (ngModelController, error) {
            if (ngModelController === undefined) {
                return false;
            }
            return ngModelController.$error[error] && $scope.model.saveAttempted;
        };

		
		
		// FUNCTION THAT RUNS ON INITIALISATION
        $scope.init = function () {

			$('#ajaxLoaderGif').css("visibility","visible");
			$scope.model.type = 'Group';
			$scope.model.userType = 'MIS ID';
			$scope.group = false;
			$scope.user = false;
			$scope.textboxMisId = true;
			$scope.userSelected = false;
			
			$scope.model.initialised = true;
			console.log('download quotas $scope.model.initialised = true');
			
			//Get list of groups (for use in group table & dropdown list)
			$scope.model.centreCode = shellService.getCurrentEntity().eqSchool.centreCode;
				downloadQuotasService.initDownloadQuotas($scope.model.centreCode).then(function (data) {
				console.log('Centrecodes = ' + JSON.stringify(data));
					//Get groups
					$scope.getDynamicGroups();
					//Prepare group names & download limits for group table
					$.each(data.groups, function(idx, obj) {
						$scope.model.smartTableGroupsRows.push(obj)
					});
					console.log('$scope.model.smartTableGroupsRows loaded');
					$('#ajaxLoaderGif').css("visibility","hidden");
					}, function () {
				});
        };
        $scope.init();
		$scope.smartTableGroups = true;
		
		
		
		// FUNCTION THAT POPULATES GETS GROUP NAMES
        $scope.getDynamicGroups = function () {
            groupSearchService.getDynamicGroups($scope.model.centreCode).then(function (data) {
                console.log('Returned data = ' + JSON.stringify(data));

				//Create a concatenated string that includes each group in the returned list 
				$scope.model.dropDownOptions = $scope.model.dropDownOptions.concat('['); //Opening square bracket
					
					$.each(data, function(idx, obj) {
						$scope.model.dropDownOptions = $scope.model.dropDownOptions.concat("{'name':'" + obj.cn + "','value':'" + obj.dn + "'},"); //Add curly opening bracket, name, value & closing curly bracket for each item in list
					});
				
				$scope.model.dropDownOptions = $scope.model.dropDownOptions.substring(0, $scope.model.dropDownOptions.length-1); //Remove last comma
				$scope.model.dropDownOptions = $scope.model.dropDownOptions.concat(']'); //Closing square bracket
				
				// Convert concatenated string back into JavaScript object so it can be used correctly by the angularJS dropdown list	
				$scope.model.dropDownOptions = eval($scope.model.dropDownOptions);
				
				console.log('Drop down list now populated with list of groups');
				$scope.group = true;
				
            }, function () {
            });
        };		
		
		
		
		// FUNCTION THAT RUNS WHEN USER SELECTS 'GROUP' OPTION
		$scope.changeToGroup = function() {
			$scope.group = true;
			$scope.user = false;
			$scope.userSelected = false;
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER SELECTS 'USER' OPTION
		$scope.changeToUser = function() {
			$scope.group = false;
			$scope.user = true;
			$scope.updateScreen();
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER SELECTS 'LAST NAME' OPTION
		$scope.changeToTextboxLastName = function() {
			$scope.clearFields();
			$scope.textboxLastName = true;
			$scope.textboxMisId = false;
			$scope.dropdown = false;	
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER SELECTS 'MIS ID' OPTION		
		$scope.changeToTextboxMisId = function() {
			$scope.clearFields();
			$scope.textboxLastName = false;
			$scope.textboxMisId = true;
			$scope.dropdown = false;
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER SELECTS 'LIST' OPTION
		$scope.changeToDropdown = function() {
			$scope.clearFields();
			$scope.textboxLastName = false;
			$scope.textboxMisId = false;
			$scope.dropdown = true;
		};
		
		
		
		// FUNCTION TO CLEAR FIELDS & VALIDATION WHEN USER SWITCHES CONTEXTS
		$scope.clearFields = function() {
			document.getElementById('textboxLastName').value = '';
			document.getElementById('textboxLastName').focus();
			document.getElementById('textboxMisId').value = '';
			document.getElementById('textboxMisId').focus();
		};
		

		
		// FUNCTION THAT RUNS WHEN USER CLOSES MODAL WINDOW OR CLICKS THE 'CLOSE' BUTTON
		$scope.cancel = function () {
            $modalInstance.dismiss();
			console.log('download quotas update cancelled');
        };
		
		
		
		// FUNCTION THAT RUNS WHEN USER ENTERS A MIS ID AND CLICKS 'FIND' BUTTON
        $scope.getUserByMisId = function (userTypeForm) {
		
			if (!userTypeForm.$valid) {
                $scope.model.saveAttempted = true;
				console.log('invalid misid');
            } else {
			
			userSearchService.getUserByMisId($scope.model.misId).then(function (data) {
    			console.log('Returned data = ' + JSON.stringify(data));
				$('#ajaxLoaderGif').css("visibility","visible");
				if (data == "") {$scope.noData()}
				else {
					$scope.model.smartTableUsersRows.push({'dn':(data.dn),'displayName':(data.displayName),'misId':(data.misId),'downloadLimit':(data.downloadLimit)})
					$scope.updateScreen();
					console.log('$scope.model.smartTableUsersRows loaded & shown');
				}
				$('#ajaxLoaderGif').css("visibility","hidden");
			}, function () {
            });
			
			}// End else
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER ENTERS A FULL OR PARTIAL LAST NAME AND CLICKS 'FIND' BUTTON
        $scope.getUserByLastName = function (userTypeForm) {
		
			if (!userTypeForm.$valid) {
                $scope.model.saveAttempted = true;
            } else {
			
			$('#ajaxLoaderGif').css("visibility","visible");
			userSearchService.getStaffStudentByLastName($scope.model.centreCode, $scope.model.lastName).then(function (data) {
				console.log('Returned data = ' + JSON.stringify(data));
				if (data == "") {$scope.noData()}
				else {
					$rootScope.rows = data;
					$scope.populateModalScreen();
				}
				}, function () {
            });
			
			}// End else
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER SELECTS A GROUP IN LIST VIEW AND CLICKS 'FIND' BUTTON
		$scope.updateSelectedList = function () {
			$scope.model.selectedGroupFromList = $scope.model.selectedGroup.value;
			$scope.getUsersInGroup();
		};
		
        $scope.getUsersInGroup = function () {
			$('#ajaxLoaderGif').css("visibility","visible");
			userSearchService.getUsersInGroup($scope.model.selectedGroupFromList).then(function (data) {
                console.log('Returned data = ' + JSON.stringify(data));
				if (data == "") {$scope.noData()}
				else {
					$rootScope.rows = data;
					$scope.populateModalScreen();
				}
			}, function () {
            });
		};
		
		
		
		// FUNCTION THAT POPULATES POP-UP MODAL SCREEN
		$scope.populateModalScreen = function () {
			$modal.open({
				templateUrl: 'views/modals/download-quotas/download-quotas-select-users.html',
				controller: 'SelectUsersDownloadQuotasCtrl'
				})
		};
		
		
		
		// FUNCTION THAT RUNS WHEN NO DATA IS RETURNED FROM THE EDGE-API
		$scope.noData = function () {
			shellService.saveComplete('No data returned for your search');
			$('#ajaxLoaderGif').css("visibility","hidden");
		};
		
		
		
		// FUNCTION TO UPDATE SCREEN BASED ON WHETHER THE SMART TABLE HAS ANY DATA
		$scope.updateScreen = function () {
			if ($scope.model.smartTableUsersRows == '')
				{
				$scope.smartTableUsers = false;
				$scope.userSelected = false;
				}
			else {
				$scope.smartTableUsers = true;
				$scope.userSelected = true;
				}
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER DELETES A USER FROM THE USERS SMART TABLE
		$scope.$on('delete', function (event, data) {
            data._deleted = true;
				var index = $scope.model.smartTableUsersRows.indexOf(data);
				$scope.model.smartTableUsersRows.splice(index, 1);
				$scope.updateScreen();
			});
			
		
		// FUNCTION THAT RUNS WHEN USER CONFIRMS SELECTIONS IN POP-UP MODAL		
		$scope.$on('updated', function () {
			// Adds each selection into the master collection in smartTableUsersRows
			$.each($rootScope.selected, function(idx, obj) {
				obj.isSelected = false; //Change to false so row isn't highlighted
                $scope.model.smartTableUsersRows.push(obj);
			});
			console.log('Selections now added to smart table');
			$scope.updateScreen();
            });
		
		
		
		//FUNCTION THAT RUNS WHEN USER UPDATES A VALUE IN THE GROUP TABLE
		$scope.$on('updateDataRow', function (event, arg) {
			console.log(JSON.stringify(arg.item.downloadLimit));
			$.each(arg, function(idx, obj) {
				$scope.model.groupQuotas[obj.dn] = parseInt(arg.item.downloadLimit); 
			});
			console.log(JSON.stringify($scope.model.groupQuotas));
		});

	
			
		// FUNCTION THAT RUNS WHEN USER CLICKS 'SUBMIT' BUTTON
		$scope.submit = function () {
		
			if ($scope.model.type == "Group")
		
				{
					var updates = {
						userDownloadQuotaAsMB: $scope.model.mbValue,
						userDNList: $scope.model.userDNList,
						groupQuotas: $scope.model.groupQuotas
						};
					var saveSuccessfulMessage = 'Download Quotas changes saved';
				}
		
			else {
					$.each($scope.model.smartTableUsersRows, function(idx, obj) {
						$scope.model.userDNList.push(obj.dn); //For each selectedUsers, add the userDN to the empty userDNList object
					});
		
					var updates = {
						userDownloadQuotaAsMB: $scope.model.mbValue,
						userDNList: $scope.model.userDNList,
						groupQuotas: null
						};
					var saveSuccessfulMessage = 'Download Quotas of ' + $scope.model.mbValue + 'MB saved successfully for users';
				}
						
				//Now call the update service & await results
				downloadQuotasService.saveUpdates(updates).then(function (data) {
					shellService.saveComplete(saveSuccessfulMessage);
					$scope.refreshTable();
				})
				
			
		};
		
		
		
		// FUNCTION THAT REFRESHES SMART TABLE AFTER SUCCESSFUL UPDATE
		$scope.refreshTable = function () {
			$.each($scope.model.smartTableUsersRows, function(idx, obj) {
				obj.downloadLimit = $scope.model.mbValue;
			});
			console.log('Smart table refreshed to reflect newly applied download limits');
		};
		
    }]
);