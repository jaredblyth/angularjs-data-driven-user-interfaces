'use strict';

angular.module('controller.lists.view', []).controller('ViewListsCtrl', ['$scope', '$modal', 'listsService', 'shellService', 'smartTableUtils', '$rootScope', 'dateUtils', 'formatUtils', '$window',
    function ($scope, $modal, listsService, shellService, smartTableUtils, $rootScope, dateUtils, formatUtils, $window) {

        console.log('created view lists controller, retrieving existing lists ...');

		
		// INITIAL VALUES
        $scope.model = {
            initialised: false,
			saveChanges: false,
			mode: 'Add',
			modeList: 'Add',
			updateListItem: false,
			update: false,
			currentEdit: '',
			currentItemEdit: '',
            smartTableCurrentLists: false,
            smartTableCurrentListsRows: [],
            smartTableCurrentListsColumns: [
                { label: 'Name', map: 'name'},
				{ label: '', cellTemplateUrl: '/views/templates/smarttable-edit-delete-row.html', reverse: false }
            ],
            smartTableCurrentListsConfig: {
                isPaginationEnabled: false,
                defaultSortColumn: 0,
                filterAlgorithm: smartTableUtils.filter
            },
			addExternalList: false,
			listTypes: [],
			addListItem: false,
			smartTableListItemsRows: [],
            smartTableListItemsColumns: [
                { label: 'Item', map: 'itemValue'},
				{ label: 'Start Date', map: 'startDate',cellTemplateUrl: '/views/templates/date-column.html'},
				{ label: 'Expiry Date', map: 'expireDate',cellTemplateUrl: '/views/templates/date-column.html'},
				{ label: 'Comment', map: 'comment'},
				{ label: '', cellTemplateUrl: '/views/templates/list-item-edit-delete-row.html', reverse: false }
            ],
            smartTableListItemsConfig: {
                isPaginationEnabled: false,
                defaultSortColumn: 0
            },
			availablePermissions: [],
			smartTablePermissionsRows: [],
            smartTablePermissionsColumns: [
                { label: 'Available Permissions', map: 'name'},
				{label: 'Applied Permissions','cellTemplateUrl':'/views/templates/smarttable-select-row.html'}
            ],
            smartTablePermissionsConfig: {
                isPaginationEnabled: false,
                defaultSortColumn: 0,
				selectionMode: 'multiple',
				displaySelectionCheckbox: true
            },
			importListItems: false,
			importedCsv: []
        };

		
		
        // FUNCTION THAT RUNS ON INITIALISATION
        $scope.init = function () {

			$rootScope.$broadcast('workingStart');
			
			// Get current lists
			listsService.findLists().then(function (data) {
			
				console.log(JSON.stringify(data));
				$scope.model.smartTableCurrentListsRows = [];
				$.each(data.lists, function(idx, obj) {
					if (obj.id == null) {obj.id = '-';}
					if (obj.name == null) {obj.name = '-';}
					if (obj.description == null) {obj.description = '-';}
					if (obj.type == null) {obj.type = [];}
					if (obj.category == null) {obj.category = '-';}
					if (obj.listItems == null) {obj.listItems = [];}
					if (obj.permissions == null) {obj.permissions = [];}

					$scope.model.smartTableCurrentListsRows.push({'id':(obj.id),'name':(obj.name),'description':(obj.description),'type':(obj.type),'category':(obj.category),'listItems':(obj.listItems),'permissions':(obj.permissions)});
				});

				$scope.model.smartTableCurrentLists = true;
				
				$scope.model.listTypes = data.types;
				console.log(JSON.stringify($scope.model.listTypes));
				
				$scope.model.initialised = true;
				$rootScope.$broadcast('workingStop');
            
			}, function () {
                $rootScope.$broadcast('workingStop');
				$rootScope.messageError = 'Unable to load current lists';
				$rootScope.$broadcast('toastMessageUpdateError');
            });
			
			
			// Get available permissions
			var roles = shellService.getAvailableRoles();
			$.each(roles, function(idx, obj) {
				var name = obj.roleName.substring(3, obj.roleName.length-11);
				$scope.model.smartTablePermissionsRows.push({"name":(name),"value":(obj.roleName)});
            });
        };
        $scope.init();
		
		
		
		// VALIDATION FUNCTION
        $scope.showError = function (ngModelController, error) {
            if (ngModelController === undefined) {
                return false;
            }
            return ngModelController.$error[error] && $scope.model.saveAttempted;
        };
		
		
		
		// FUNCTIONS TO DELETE & UNDELETE A LIST
        $scope.$on('delete', function (event, data) {
            data._deleted = true;
			data._mayUnDelete = true; //Show undelete button
			data._mayEdit = true; //Hide edit button
			data._mayDelete = true; //Hide delete button
			$scope.model.saveChanges = true;
        });

		
        $scope.$on('undelete', function (event, data) {
            data._deleted = false;
			data._mayUnDelete = false; //Hide undelete button
			data._mayEdit = false; //Show edit button
			data._mayDelete = false; //Show delete button
        });


		
		// FUNCTION THAT RUNS WHEN USER CLICKS 'ADD NEW EXTERNAL LIST' BUTTON
		$scope.addExternalList = function () {
			$scope.model.mode = 'Add';
			$scope.model.update = false;
			$scope.model.listName = '';
			$scope.model.listCategory = '';
			$scope.model.listType = '';
			$scope.model.listDescription = '';
			$scope.model.smartTableListItemsRows = [];
			$scope.model.smartTablePermissions = [];
			$scope.model.smartTablePermissionsRows = [];
			// Get available permissions
			var roles = shellService.getAvailableRoles();
			$.each(roles, function(idx, obj) {
				var name = obj.roleName.substring(3, obj.roleName.length-11);
				$scope.model.smartTablePermissionsRows.push({"name":(name),"value":(obj.roleName)});
            });
			$scope.model.addExternalList = true;
			$('#externalLists').collapse('hide');
			$('#addExternalLists').collapse('show');
			$('#listItems').collapse('hide');
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER CLICKS 'CANCEL (ADD NEW EXTERNAL LIST)' BUTTON
		$scope.cancelAddExternalList = function () {
			$scope.model.addExternalList = false;
			$('#externalLists').collapse('show');
			$('#addExternalLists').collapse('hide');
			$('#listItems').collapse('hide');
			$scope.model.mode = 'Add';
			$scope.model.update = false;
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER CLICKS 'ADD NEW LIST' BUTTON
		$scope.addLists = function () {
			
			// validate form
            //if (!addExternalListForm.$valid){
               // console.log('Form is invalid');
				//shellService.saveComplete();
				//$scope.model.saveAttempted = true;

            //} else {
			
			$scope.model.smartTablePermissionsRows = [];
			var permissions = [];
			$.each($scope.model.smartTablePermissionsRows, function(idx, obj) {
				if (obj.isSelected == true)
					{
					permissions.push({"permission":obj.value});
					}
			 });
			$scope.model.smartTableCurrentListsRows.push({'name':($scope.model.listName),'description':($scope.model.listDescription),'type':($scope.model.listType),'category':($scope.model.listCategory),'permissions':(permissions),'listItems':($scope.model.smartTableListItemsRows),'_added':true});
			$scope.model.addExternalList = false;
			$('#externalLists').collapse('show');
			$('#addExternalLists').collapse('hide');
			$scope.model.saveChanges = true;
			console.log(JSON.stringify($scope.model.smartTableCurrentListsRows));
			
			//} //End else
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER CLICKS 'UPDATE LIST' BUTTON
		$scope.updateLists = function () {

			// validate form
            //if (!addExternalListForm.$valid){
               // console.log('Form is invalid');
				//shellService.saveComplete();
				//$scope.model.saveAttempted = true;

            //} else {
			
			$.each($scope.model.smartTableCurrentListsRows, function(idx, obj) {
			
				if (obj.name == $scope.model.currentEdit)
				{
				obj._edited = true;
				obj.name = $scope.model.listName;
				obj.description = $scope.model.listDescription;
				obj.type = $scope.model.listType;
				obj.category = $scope.model.listCategory;
				obj.listItems = $scope.model.smartTableListItemsRows;
				obj.permissions = [];
				var permissions = [];
					$.each($scope.model.smartTablePermissionsRows, function(idx, obj2) {
						if (obj2.isSelected == true)
						{
						obj.permissions.push({"permission":obj2.value});
						}
			 });
				
				}
			
			});
			
			$scope.model.addExternalList = false;
			$('#externalLists').collapse('show');
			$('#addExternalLists').collapse('hide');
			$scope.model.saveChanges = true;
			
			//} //End else
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER CLICKS 'ADD NEW LIST ITEM' BUTTON
		$scope.addListItem = function () {
			$scope.model.listItemValue = '';
			$scope.model.listStartDate = '';
			$scope.model.listExpireDate = '';
			$scope.model.listItemComment = '';
			$scope.model.addListItem = true;
			$('#externalLists').collapse('hide');
			$('#addExternalLists').collapse('hide');
			$('#listItems').collapse('show');
			console.log(JSON.stringify($scope.model.smartTableListItemsRows));
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER CLICKS 'CANCEL (ADD NEW LIST ITEM)' BUTTON
		$scope.cancelAddListItem = function () {
			$scope.model.addListItem = false;
			$('#externalLists').collapse('hide');
			$('#addExternalLists').collapse('show');
			$('#listItems').collapse('hide');
		};
		
		
		
		// FUNCTIONS TO DELETE & UNDELETE A LIST ITEM
        $scope.$on('deleteListItem', function (event, data) {
            data._deleted = true;
			data._mayUnDelete = true; //Show undelete button
			data._mayEdit = true; //Hide edit button
			data._mayDelete = true; //Hide delete button
        });

		
        $scope.$on('undeleteListItem', function (event, data) {
            data._deleted = false;
			data._mayUnDelete = false; //Hide undelete button
			data._mayEdit = false; //Show edit button
			data._mayDelete = false; //Show delete button
        });
		
		
		$scope.$on('editListItem', function (event, data) {
			$scope.model.currentItemEdit = data.itemValue;
			$scope.model.listItemValue = data.itemValue;
			$scope.model.listItemStartDate = formatUtils.formatDate(data.startDate);
			$scope.model.listItemExpiryDate = formatUtils.formatDate(data.expireDate);
			$scope.model.listItemComment = data.comment;
			$scope.model.addListItem = true;
			$scope.model.modeList = 'Update';
			$scope.model.updateListItem = true;
			$('#externalLists').collapse('hide');
			$('#addExternalLists').collapse('hide');
			$('#listItems').collapse('show');
		});
		
		
		
		// FUNCTION THAT RUNS WHEN USER EDITS A LIST ITEM
		$scope.updateListItem = function () {
			$.each($scope.model.smartTableListItemsRows, function(idx, obj) {
			
				if (obj.itemValue == $scope.model.currentItemEdit)
				{
				obj._edited = true;
				obj.itemValue = $scope.model.listItemValue;
				obj.startDate = $scope.model.listItemStartDate;
				obj.expireDate = $scope.model.listItemExpiryDate;
				obj.comment = $scope.model.listItemComment;
				}
			
			});
			$scope.model.updateListItem = false;
			$scope.model.addListItem = false;
			$('#externalLists').collapse('hide');
			$('#addExternalLists').collapse('show');
			$('#listItems').collapse('hide');
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER CLICKS 'ADD LIST ITEM' BUTTON
		$scope.saveListItem = function () {
		
			// validate form
           // if (!addListItemForm.$valid){
               // console.log('Form is invalid');
				//shellService.saveComplete();
				//$scope.model.saveAttempted = true;

            //} else {
			
			$scope.model.listItemStartDate = dateUtils.convertDate($scope.model.listItemStartDate);
			$scope.model.listItemExpiryDate = dateUtils.convertDate($scope.model.listItemExpiryDate);
			
			$scope.model.smartTableListItemsRows.push({"itemValue":$scope.model.listItemValue,"startDate":$scope.model.listItemStartDate,"expireDate":$scope.model.listItemExpiryDate,"comment":$scope.model.listItemComment});
			console.log(JSON.stringify($scope.model.smartTableListItemsRows));
			$scope.model.addListItem = false;
			$('#externalLists').collapse('hide');
			$('#addExternalLists').collapse('show');
			$('#listItems').collapse('hide');
			
			//}//End else
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER CLICKS 'DELETE ALL' BUTTON
		$scope.deleteAllListItems = function () {
			$scope.model.smartTableListItemsRows = [];
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER CLICKS 'BULK IMPORT' BUTTON
		$scope.importListItems = function () {
			$scope.model.importListItems = true;
			$('#addExternalLists').collapse('hide');
			$('#importListItems').collapse('show');
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER CANCELS BULK IMPORT OF LIST ITEMS
		$scope.cancelImportListItems = function () {
			$scope.model.importListItems = false;
			$('#addExternalLists').collapse('show');
			$('#importListItems').collapse('hide');
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER CONFIRMS UPLOAD
		$scope.confirmImportListItems = function () {
			var output = window.output;
			alert(output);
			$scope.cancelImportListItems();
		};
		
		
		
		// FUNCTION THAT RUNS WHEN USER CLICKS 'EDIT' BUTTON
		$scope.$on('edit', function (event, data) {
			$scope.model.currentEdit = data.name;
			$scope.model.listName = data.name
			$scope.model.listCategory = data.category
			$scope.model.listType = data.type
			$scope.model.listDescription = data.description
			$scope.model.smartTableListItemsRows = [];
			$.each(data.listItems, function(idx, obj) {
				if (obj.itemValue == null){obj.itemValue = '-';}
				if (obj.startDate == null){obj.startDate = '-';}
				if (obj.expireDate == null){obj.expireDate = '-';}
				if (obj.comment == null){obj.comment = '-';}
				$scope.model.smartTableListItemsRows.push({"itemValue":(obj.itemValue),"startDate":(obj.startDate),"expireDate":(obj.expireDate),"comment":(obj.comment)});
			});

			$.each($scope.model.smartTablePermissionsRows, function(idx, obj) {
				var selected = JSON.stringify(data.permissions).search(obj.value);
				if (selected != -1) {obj.isSelected = true;}
			});
			$scope.model.addExternalList = true;
			$scope.model.mode = 'Update';
			$scope.model.update = true;
			$('#externalLists').collapse('hide');
			$('#addExternalLists').collapse('show');
			$('#listItems').collapse('hide');
		});

		
		
		// FUNCTION TO SAVE CHANGES TO EXTERNAL LISTS (if any)
		$scope.save = function () {
            console.log('time to save all the changes (if any have been made)');
			$rootScope.$broadcast('workingStart');
			
			//Remove deleted list items
			for (var i = 0; i < $scope.model.smartTableListItemsRows.length; i++) {
				var item = $scope.model.smartTableListItemsRows[i];
				if (item._deleted) {
					var index = $scope.model.smartTableListItemsRows.indexOf(item);
					$scope.model.smartTableListItemsRows.splice(index,1);
					}
				}
            
			// Now build master update
			var updates = {
                addedLists: [],
                updatedLists: [],
                deletedLists: []
            };

            // locate added, updated, and deleted lists and add to the updates object appropriately
            for (var i = 0; i < $scope.model.smartTableCurrentListsRows.length; i++) {
                var list = $scope.model.smartTableCurrentListsRows[i];
                if (list._added) {
                    updates.addedLists.push(smartTableUtils.stripObject(angular.copy(list)));
                } else if (list._edited) {
                    updates.updatedLists.push(smartTableUtils.stripObject(angular.copy(list)));
                } else if (list._deleted) {
					var index = $scope.model.smartTableCurrentListsRows.indexOf(item);
					$scope.model.smartTableCurrentListsRows.splice(index,1);
					updates.deletedLists.push(list.id);
                }
            }

			console.log(JSON.stringify(updates));
			
            listsService.saveUpdates(updates).then(function (data) {
				shellService.saveComplete();
				$rootScope.$broadcast('workingStop');
				$rootScope.messageSuccess = 'Changes to external lists saved';				
				$rootScope.$broadcast('toastMessageUpdateSuccess');
				$scope.model.smartTableCurrentLists = false;
				$scope.init();
            }, function () {
                shellService.saveComplete();
				$rootScope.$broadcast('workingStop');
				$rootScope.messageError = 'Failed to save changes to external lists';
				$rootScope.$broadcast('toastMessageUpdateError');
                });
            };

    }
]);


// FUNCTION TO IMPORT CSV FILE AND CONVERT TO JSON OBJECT (this is a javascript function outside of the above angular controller)
function handleFiles(files) {
	// Check for the various File API support.
	if (window.FileReader) {
		// FileReader are supported.
		getAsText(files[0]);
	} else {
		alert('FileReader are not supported in this browser.');
	}
}

function getAsText(fileToRead) {
	var reader = new FileReader();
	// Handle errors load
	reader.onload = loadHandler;
	reader.onerror = errorHandler;
	// Read file into memory as UTF-8      
	reader.readAsText(fileToRead);
}

function loadHandler(event) {
	var csv = event.target.result;
	processData(csv);             
}

function processData(csv) {
    var allTextLines = csv.split(/\r\n|\n/);
    var lines = [];
    while (allTextLines.length) {
        lines.push(allTextLines.shift().split(','));
    }
	console.log(lines);
	drawOutput(lines);
}

function errorHandler(evt) {
	if(evt.target.error.name == "NotReadableError") {
		alert("Cannot read file !");
	}
}

function drawOutput(lines){
	var output = [];
	$.each(lines, function(idx, obj) {
		output.push({"item":(obj[0]),"startDate":(obj[1]),"expireDate":(obj[2]),"comment":(obj[3])});				
	});
	console.log(JSON.stringify(output));

	
}