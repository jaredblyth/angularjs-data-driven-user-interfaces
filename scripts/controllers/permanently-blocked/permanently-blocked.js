'use strict';

angular.module('controller.permanentlyBlocked.view', []).controller('PermanentlyBlockedCtrl', ['$scope', 'shellService', 'permanentlyBlockedService', 'smartTableUtils', '$timeout', '$rootScope',
    function ($scope, shellService, permanentlyBlockedService, smartTableUtils, $timeout, $rootScope) {

        console.log('created permanently blocked sites controller, retrieving existing blocked sites ...');

		
		// INITIAL VALUES
		$scope.model = {
			initialised: false,
			saveAttempted: false,
            smarttablePermanentlyBlockedSites: '',
			smarttablePermanentlyBlockedSitesRows: [],
            smarttablePermanentlyBlockedSitesColumns: [
                { 'label': 'Site', 'map': 'site', 'cellTemplateUrl': '/intadmin/views/templates/url-tablecell.html', 'cellClass': 'info-url', 'isEditable': true},
                { 'label': '', 'cellTemplateUrl': '/intadmin/views/templates/smarttable-edit-delete-row.html', 'isEditable': true }
            ],
            smarttablePermanentlyBlockedSitesConfig: {
                isPaginationEnabled: false,
                isGlobalSearchActivated: true,
                filterAlgorithm: smartTableUtils.filter,
				defaultSortColumn: 0
            },
			addSite: false,
			editSite: false,
			newSite: '',
			updatedSite: '',
			saveChanges: false
        };

		
		
		// FUNCTION THAT RUNS ON INITIALISATION
		$scope.init = function () {
            console.log('initialising permanently blocked sites controller ...');
			$rootScope.$broadcast('workingStart');
			$scope.model.saveChanges = false;
            permanentlyBlockedService.initialisePermanentlyBlocked().then(function (data) {
				console.log(JSON.stringify(data));
				$.each(data.permanentlyBlockedSites, function(idx, obj) {
					$scope.model.smarttablePermanentlyBlockedSitesRows.push({'site':(obj.site)});
				});
				$scope.model.smarttablePermanentlyBlockedSites = true;
                $scope.model.initialised = true;
				$rootScope.$broadcast('workingStop');
            }, function () {
                $rootScope.$broadcast('workingStop');
				$rootScope.messageError = 'Unable to load permanently blocked sites at the moment';
				$rootScope.$broadcast('toastMessageUpdateError');
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
	   
	   
	   
	   // FUNCTION TO ADD A NEW SITE
	   $scope.addNewSite = function () {
			$scope.model.addSite = true;
			$scope.model.editSite = false;
	   };
	   
	   
	   $scope.addNewConfirm = function (addSiteForm) {
	   
			// validate form
            if (!addSiteForm.$valid) {
                shellService.saveComplete();
				$scope.model.saveAttempted = true;

            } else {
				$scope.model.addSite = false;
				$scope.model.smarttablePermanentlyBlockedSitesRows.push({'site':($scope.model.newSite)});
				shellService.saveComplete();
				document.getElementById('addNewSite').focus();
				document.getElementById('addSiteInput').value = '';
				$scope.model.saveAttempted = true;
				$scope.model.saveChanges = true;
			}
	   };
	   
	   
	   $scope.addNewCancel = function () {
			$scope.model.addSite = false;
			document.getElementById('addNewSite').focus();
			document.getElementById('addSiteInput').value = '';
			$scope.model.newSite = '';
			$scope.model.saveAttempted = false;
	   };
	   
	   
	   
	   // FUNCTION TO EDIT/UPDATE A SITE
	   $scope.$on('edit', function (event, data) {
			console.log(JSON.stringify($scope.model.smarttablePermanentlyBlockedSitesRows));
			$scope.model.addSite = false;
			$scope.model.editSite = true;
			$scope.model.updatedSite = data.site;
			$scope.model.updatedIndex = data;
	   });
	   
	   
	   $scope.editConfirm = function (editSiteForm) {
	   
			// validate form
            if (!editSiteForm.$valid) {
                shellService.saveComplete();
				$scope.model.saveAttempted = true;

            } else {
				$scope.model.editSite = false;
				
				for (var i = 0; i < $scope.model.smarttablePermanentlyBlockedSitesRows.length; i++) {
                           if ($scope.model.smarttablePermanentlyBlockedSitesRows[i].$$hashKey === $scope.model.updatedIndex.$$hashKey) {
                                $scope.model.smarttablePermanentlyBlockedSitesRows.splice(i, 1);
                           }
                        }
				var temp = $scope.model.smarttablePermanentlyBlockedSitesRows;
				$scope.model.smarttablePermanentlyBlockedSitesRows = [];
					$.each(temp, function(idx, obj) {
						$scope.model.smarttablePermanentlyBlockedSitesRows.push({'site':(obj.site),"$$hashKey":(obj.$$hashKey)});
					});
				$scope.model.smarttablePermanentlyBlockedSitesRows.push({"site":$scope.model.updatedSite,"$$hashKey":$scope.model.updatedIndex.$$hashKey,"_edited":true});
				temp = $scope.model.smarttablePermanentlyBlockedSitesRows;
				$scope.model.smarttablePermanentlyBlockedSitesRows = [];
					$.each(temp, function(idx, obj) {
						$scope.model.smarttablePermanentlyBlockedSitesRows.push({'site':(obj.site)});
					});
				
				//data._edited = true;
				shellService.saveComplete();
				$scope.model.saveChanges = true;
				$scope.addNewCancel();
			}
	   };
	   
	   
	   $scope.editCancel = function () {
			$scope.model.editSite = false;
			$scope.model.editSite = '';
			$scope.addNewCancel();
	   };
	   
	   

		// FUNCTIONS TO DELETE & UNDELETE A SITE
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
		
		
		
		// FUNCTION TO SAVE CHANGES
		$scope.saveChanges = function () {	
			$rootScope.$broadcast('workingStart');
			
			var updates = {
               permanentlyBlockedSiteList: []
            };
			
			$.each($scope.model.smarttablePermanentlyBlockedSitesRows, function(idx, obj) {	
				if (obj._deleted != true)	
				{updates.permanentlyBlockedSiteList.push({'site':(obj.site)});}
			});
		
			permanentlyBlockedService.batchUpdatePermanentlyBlocked(updates).then(function (data) {
				$rootScope.$broadcast('workingStop');
				$rootScope.messageSuccess = 'List of permanently blocked sites successfully saved';
				$rootScope.$broadcast('toastMessageUpdateSuccess');
				$scope.model.smarttablePermanentlyBlockedSitesRows = updates.permanentlyBlockedSiteList;
				$scope.model.saveChanges = false;
                }, function () {
				$rootScope.$broadcast('workingStop');
				$rootScope.messageError = 'Unable to save changes at the moment';
				$rootScope.$broadcast('toastMessageUpdateError');
                });
	   };


    }]);
