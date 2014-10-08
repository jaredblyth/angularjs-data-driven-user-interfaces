'use strict';

angular.module('controller.deviceFiltering', ['ngCsv'])


.controller('DeviceFilteringCtrl', ['$scope', '$rootScope', '$modal', '$modalInstance', 'deviceFilteringService', 'smartTableUtils', 'shellService', 'userSearchService', 'groupSearchService',
    function ($scope, $rootScope, $modal, $modalInstance, deviceFilteringService, smartTableUtils, shellService, userSearchService, groupSearchService) {


        console.log('created device filtering controller');

		
		// INITIAL VALUES
        $scope.model = {
            initialised: false,
			SelectedRows: [],
			SelectedColumns: [
				{'label':'Name','map':'displayName','headerClass': 'displayName-cell', isSortable:false},
				{'label':'MIS ID','map':'misId', isSortable:false},
				{'label':'Filter Level','map':'proxyClientFilterLevel', isSortable:false},
				{'label':'Remove','cellTemplateUrl':'views/templates/smarttable-delete-row.html', isSortable:false, 'isEditable': true}
			],			
			SelectedConfig: {
				isPaginationEnabled: false,
                defaultSortColumn: 1
            },
            saveAttempted: false,
			misId: '',
            lastName: '',
			dropDownOptions:  '',
			selectedGroup: '',
			selectedGroupName: '',
			centreCode: '',
			selectedUsers: '',
			filteringLevel: '',
			currentRows: [],
			newRows: '',
            groupDN: '',
			exportCsv: [],
			exportCsvGroup: [],
			exportCsvData: []
		};
		console.log('device filtering $scope.model config set, all fields cleared');

		
		
		// VALIDATION FUNCTION
        $scope.showError = function (ngModelController, error) {
            if (ngModelController === undefined) {
                return false;
            }
            return ngModelController.$error[error] && $scope.model.saveAttempted;
        };

		
		
		// FUNCTION THAT RUNS ON INITIALISATION
        $scope.init = function () {

            $scope.model.userGroup = 'MIS ID';
			$scope.textboxLastName = false;
			$scope.textboxMisId = true;
			$scope.dropdown = false;
			$scope.smartTable = false;
			$scope.model.filteringLevel = 'Medium';
			$scope.model.centreCode = shellService.getCurrentEntity().eqSchool.centreCode;				
			
			$scope.model.initialised = true;
			console.log('device filtering $scope.model.initialised = true');

            deviceFilteringService.initDeviceFiltering($scope.model.centreCode).then(function (data) {
				console.log('Centrecodes = ' + JSON.stringify(data));
			//Get groups
			$scope.getDynamicGroups();
            }, function () {
            });
			
        };
        $scope.init();
		
		
		
		// FUNCTION THAT POPULATES DROP DOWN MENU
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
				
				// Convert concatenated string back into JavaScript object so it can be used correctly by the angularJS drop-down list	
				$scope.model.dropDownOptions = eval($scope.model.dropDownOptions);
				console.log('Drop down list now populated with list of groups');
	
            }, function () {
            });
        };



		// FUNCTION TO CLEAR FIELDS & VALIDATION WHEN USER SWITCHES CONTEXTS
		$scope.clearFields = function() {
			document.getElementById('textboxLastName').value = '';
			document.getElementById('textboxLastName').focus();
			document.getElementById('textboxMisID').value = '';
			document.getElementById('textboxMisID').focus();
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER SELECTS 'LAST NAME' OPTION
		$scope.changeToTextboxLastName = function() {
			$scope.clearFields();
			$scope.textboxLastName = true;
			$scope.textboxMisId = false;
			$scope.dropdown = false;
			$scope.dropdownGroup = false;
		};
		
		// FUNCTION THAT RUNS WHEN USER SELECTS 'MIS ID' OPTION		
		$scope.changeToTextboxMisId = function() {
			$scope.clearFields();
			$scope.textboxLastName = false;
			$scope.textboxMisId = true;
			$scope.dropdown = false;
			$scope.dropdownGroup = false;
		};
		
		// FUNCTION THAT RUNS WHEN USER SELECTS 'LIST' OPTION
		$scope.changeToDropdown = function() {
			$scope.clearFields();
			$scope.textboxLastName = false;
			$scope.textboxMisId = false;
			$scope.dropdown = true;
			$scope.dropdownGroup = false;
		};
		
		// FUNCTION THAT RUNS WHEN USER SELECTS 'GROUP' OPTION
		$scope.changeToGroup = function() {
			$scope.smartTable = false;
			$scope.model.SelectedRows = ''; // Clear current table
			$scope.model.selectedUsers = '';
			$scope.model.currentRows = '';
			$scope.clearFields();
			$scope.textboxLastName = false;
			$scope.textboxMisId = false;
			$scope.dropdown = false;
			$scope.dropdownGroup = true;
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER ENTERS A MIS ID AND CLICKS 'FIND' BUTTON
        $scope.getUserByMisId = function (userGroupForm) {

            if (!userGroupForm.$valid) 
				{$scope.model.saveAttempted = true;}
				
			else 
				{
                $('#ajaxLoaderGif').css("visibility","visible");
                userSearchService.getUserByMisId($scope.model.misId).then(function (data) {

                    // Test whether a value is present for proxyClientFilterLevel
                    var proxyClientFilterLevel = '';
					if(data.proxyClientFilterLevel == null)
                        {proxyClientFilterLevel = 'Not set';}
                    else {proxyClientFilterLevel = data.proxyClientFilterLevel;}

                    $scope.model.newRows = [{'userDN':(data.userDN),'displayName':(data.displayName),'misId':(data.misId),'proxyClientFilterLevel':proxyClientFilterLevel}];

                    // Add new found search results to previously selected results
                    $.each($scope.model.selectedUsers, function(idx, obj) {
						$scope.model.newRows.push(obj);
                    });
                    $scope.model.SelectedRows = $scope.model.newRows;
                    $scope.model.currentRows = $scope.model.SelectedRows;

                    //Run a function depending on whether some data has been returned from the edge-api
                    if (data == "") 
						{$scope.noData()} 
					else {$scope.updateDataModel();}
					
				}, function () {
                });
			
				}// End else
        };

		
		
		// FUNCTION THAT RUNS WHEN USER ENTERS A FULL OR PARTIAL LAST NAME AND CLICKS 'FIND' BUTTON
        $scope.getUserByLastName = function (userGroupForm) {
            
			if (!userGroupForm.$valid) 
				{$scope.model.saveAttempted = true;}
				
			else 
				{
				$('#ajaxLoaderGif').css("visibility","visible");
                $scope.populateModalScreen();
				}
        };
		
		
		
		// FUNCTION THAT RUNS WHEN USER SELECTS A GROUP FROM DROP-DOWN MENU IN LIST VIEW
		$scope.updateSelectedList = function () {
			$scope.model.selectedGroupFromList = $scope.model.selectedGroup.value;
			$scope.getUsersInGroup();
		};
		
		

		// FUNCTION THAT RUNS WHEN USER SELECTS A GROUP IN LIST VIEW AND CLICKS 'FIND' BUTTON
        $scope.getUsersInGroup = function () {
			$('#ajaxLoaderGif').css("visibility","visible");
            userSearchService.getUsersInGroup($scope.model.selectedGroupFromList).then(function (data) {
                console.log('Returned data = ' + JSON.stringify(data));
				
				// Test whether a value is present for proxyClientFilterLevel for each user in the returned data
				$.each(data, function(idx, obj) {
					if (obj.proxyClientFilterLevel == null)
						{obj.proxyClientFilterLevel = "Not Set";}
				});
				
				//Run a function depending on whether some data has been returned from the edge-api
				if (data == "") 
					{$scope.noData()}
				else 
					{
						$rootScope.rows = data;
						$modal.open({
							templateUrl: 'views/modals/device-filtering/select-user-or-group.html',
							controller: 'SelectUserGroupCtrl'
							})
						$scope.smartTable = false;
					} 

            }, function () {
            });
        };	
		
		
		
		//FUNCTION THAT POPULATES POP-UP MODAL SCREEN
		$scope.populateModalScreen = function () {
            userSearchService.getStaffStudentByLastName($scope.model.centreCode, $scope.model.lastName).then(function (data) {
				console.log('Returned data = ' + JSON.stringify(data));
				
			// Test whether a value is present for proxyClientFilterLevel for each user in the returned data
			$.each(data, function(idx, obj) {
				if (obj.proxyClientFilterLevel == null)
					{obj.proxyClientFilterLevel = "Not Set";}
				});

			if (data == "")
				{$scope.noData()}
			else {
					$rootScope.rows = data;
					$modal.open({
						templateUrl: 'views/modals/device-filtering/select-user-or-group.html',
						controller: 'SelectUserGroupCtrl'
					})
					$scope.smartTable = false;
				} 
			
			}, function () {
            });	
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER CONFIRMS SELECTIONS IN POP-UP MODAL		
		$scope.$on('updated', function () {
			$.each($rootScope.selected, function(idx, obj) {
				obj.isSelected = false; //Change to false so row isn't highlighted
                $scope.model.SelectedRows.push(obj);
			});
			console.log(JSON.stringify($scope.model.SelectedRows));
			$scope.updateDataModel();
        });


		
		// FUNCTION THAT RUNS WHEN USER DELETES A USER FROM THE SMART TABLE
		$scope.$on('delete', function (event, data) {
            data._deleted = true;
				var index = $scope.model.SelectedRows.indexOf(data);
				$scope.model.SelectedRows.splice(index, 1);
				$scope.updateDataModel();
				$scope.smartTable = true;
		});
		
		

		// FUNCTION THAT UPDATES DATA MODEL WHEN USER MAKES CHANGES TO SMART TABLE etc
		$scope.updateDataModel = function () {
			$scope.model.selectedUsers = $scope.model.SelectedRows; //Data to be submitted for device filter change
            $('#ajaxLoaderGif').css("visibility","hidden"); 
			if ($scope.model.selectedUsers == '')
				{$scope.smartTable = false;} 
			else {$scope.smartTable = true;}
			$scope.prepareExportCsv();	
        };
		
		
		
		// FUNCTION THAT UPDATES DATA FOR CSV EXPORT
		$scope.prepareExportCsv = function () {
		if ($scope.model.userGroup == "Group")
			{$scope.model.exportCsvData = $scope.model.exportCsvGroup;} 
		else {$scope.model.exportCsvData = $scope.model.selectedUsers;} 
		$scope.model.exportCsv = [];
			$.each($scope.model.exportCsvData, function(idx, obj) {
				$scope.model.exportCsv.push({'displayName':(obj.displayName),'misId':(obj.misId),'proxyClientFilterLevel':(obj.proxyClientFilterLevel)});
			});
		};
		
		
		
		// FUNCTION THAT RUNS WHEN NO DATA IS RETURNED FROM THE EDGE-API
		$scope.noData = function () {
			$scope.model.selectedUsers = $scope.model.SelectedRows; //Data to be submitted for device filter change
			if ($scope.model.selectedUsers == '')
				{$scope.smartTable = false;} 
			else {$scope.smartTable = true;}
            $('#ajaxLoaderGif').css("visibility","hidden");
			shellService.saveComplete("No data found for your search request");			
        };
		
		
		
		// FUNCTION THAT RUNS WHEN USER SELECTS A GROUP FROM DROP-DOWN MENU IN GROUP VIEW
		$scope.updateSelectedGroup = function () {
			$scope.model.groupDN = $scope.model.selectedGroup.value;
			shellService.saveComplete($scope.model.selectedGroup.name + ' group selected');
			
			// Still adding individual group members to data model so that user names can be exported in csv
			userSearchService.getUsersInGroup($scope.model.groupDN).then(function (data) {
                console.log('Returned data = ' + JSON.stringify(data));
				
				// Test whether a value is present for proxyClientFilterLevel for each user in the returned data
				$.each(data, function(idx, obj) {
					if (obj.proxyClientFilterLevel == null)
						{obj.proxyClientFilterLevel = "Not Set"; console.log('proxyClientFilterLevel not set');}
					});

				$scope.model.exportCsvGroup = data;
				$scope.prepareExportCsv();
				
			}, function () {
            });	
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER CLICKS 'SUBMIT' BUTTON
        $scope.submit = function () {

			var userDNList = []; // Start with empty object
		
			if ($scope.model.selectedUsers == '' && $scope.model.userGroup !== "Group")

				{shellService.saveComplete('No changes made due to no selection');}
				
			else {

				$.each($scope.model.selectedUsers, function(idx, obj) {
					userDNList.push(obj.userDN); //For each selectedUsers, add the userDN to the empty userDNList object
				});

				//Now ready to create the updates variable that is expected by the edge-api
				if ($scope.model.userGroup == "Group")
					
					{
					var updates = {
						deviceFilteringLevelAsString: $scope.model.filteringLevel,
						userDNList: [],
						groupDN: $scope.model.groupDN
						};
					var saveSuccessfulMessage = $scope.model.selectedGroup.name + ' group filtering level saved successfully';
					}
						
				else {
					var updates = {
						deviceFilteringLevelAsString: $scope.model.filteringLevel,
						userDNList: userDNList,
						groupDN: null
						};
					var saveSuccessfulMessage = 'Filtering level saved successfully';
					}
				
				console.log(JSON.stringify(updates));
				console.log('device filtering update submitted');
		
				//Now call the update service & await results
				deviceFilteringService.saveUpdates(updates).then(function (data) {
					shellService.saveComplete(saveSuccessfulMessage);
					$scope.refreshTable();
				})
				
			}//End else
		};
		
		
		
		// FUNCTION THAT REFRESHES SMART TABLE AFTER SUCCESSFUL UPDATE
		$scope.refreshTable = function () {
			$.each($scope.model.SelectedRows, function(idx, obj) {
				obj.proxyClientFilterLevel = $scope.model.filteringLevel;
			});
			$scope.prepareExportCsv();
		};
		

		
		// FUNCTION THAT RUNS WHEN USER CLOSES MODAL WINDOW OR CLICKS THE 'CLOSE' BUTTON
		$scope.cancel = function () {
            $modalInstance.dismiss();
			console.log('device filtering update cancelled');
        };
		
		
    }]
);